"use client";

import {
  BookOpen,
  Download,
  FastForward,
  Headphones,
  Home,
  Pause,
  Play,
  Rewind,
  SkipBack,
  SkipForward,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Book } from "@/lib/books";

type BookPodcastProps = {
  book: Book;
};

type StoredBookProgress = {
  version?: number;
  chapterIndex?: number;
  paragraphIndex?: number;
  paragraphId?: string;
  scrollOffset?: number;
  fontScale?: number;
  speechRate?: number;
  podcastRate?: number;
  autoAdvancePodcast?: boolean;
  podcastChapterIndex?: number | null;
  podcastCurrentTime?: number;
  podcastDuration?: number;
  updatedAt?: number;
};

type MediaSessionNavigator = Navigator & {
  mediaSession?: MediaSession;
};

const progressKeyPrefix = "book-reader-progress";
const podcastRates = [1, 1.25, 1.5, 1.75, 2, 2.5];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  return `${minutes}:${String(wholeSeconds % 60).padStart(2, "0")}`;
}

export function BookPodcast({ book }: BookPodcastProps) {
  const audioEpisodes = useMemo(
    () =>
      book.chapters.flatMap((chapter, chapterIndex) =>
        chapter.audio?.src ? [{ chapter, chapterIndex }] : [],
      ),
    [book.chapters],
  );
  const firstEpisodeIndex = audioEpisodes[0]?.chapterIndex ?? 0;
  const [episodeIndex, setEpisodeIndex] = useState(firstEpisodeIndex);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(
    book.chapters[firstEpisodeIndex]?.audio?.durationSeconds ?? 0,
  );
  const [rate, setRate] = useState(1);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSavedPosition, setHasSavedPosition] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hydratedRef = useRef(false);
  const episodeIndexRef = useRef(firstEpisodeIndex);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(duration);
  const rateRef = useRef(1);
  const autoAdvanceRef = useRef(true);
  const isPlayingRef = useRef(false);
  const resumeAtRef = useRef(0);
  const autoplayAfterLoadRef = useRef(false);
  const lastPersistAtRef = useRef(0);

  const currentChapter = book.chapters[episodeIndex] ?? book.chapters[firstEpisodeIndex];
  const currentAudio = currentChapter?.audio?.src ? currentChapter.audio : null;
  const currentEpisodePosition = audioEpisodes.findIndex(
    (episode) => episode.chapterIndex === episodeIndex,
  );
  const previousEpisode = currentEpisodePosition > 0
    ? audioEpisodes[currentEpisodePosition - 1]
    : null;
  const nextEpisode = currentEpisodePosition >= 0 && currentEpisodePosition < audioEpisodes.length - 1
    ? audioEpisodes[currentEpisodePosition + 1]
    : null;
  const progressPercent = duration > 0
    ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
    : 0;
  const statusLabel = error
    ? "播放異常"
    : isLoading
      ? "載入中"
      : isPlaying
        ? "播放中"
        : hasSavedPosition && currentTime > 0
          ? "可續播"
          : "準備播放";

  const persistProgress = useCallback((
    nextEpisodeIndex = episodeIndexRef.current,
    nextCurrentTime = currentTimeRef.current,
    nextDuration = durationRef.current,
  ) => {
    if (!hydratedRef.current) return;

    const key = `${progressKeyPrefix}:${book.slug}`;
    let existing: StoredBookProgress = {};
    try {
      existing = JSON.parse(window.localStorage.getItem(key) ?? "{}") as StoredBookProgress;
    } catch {
      existing = {};
    }

    window.localStorage.setItem(
      key,
      JSON.stringify({
        ...existing,
        version: 3,
        podcastRate: rateRef.current,
        autoAdvancePodcast: autoAdvanceRef.current,
        podcastChapterIndex: nextEpisodeIndex,
        podcastCurrentTime: Math.max(0, nextCurrentTime),
        podcastDuration: Math.max(0, nextDuration),
        updatedAt: Date.now(),
      } satisfies StoredBookProgress),
    );
  }, [book.slug]);

  const updateMediaPosition = useCallback((nextTime: number, nextDuration: number) => {
    const mediaSession = (navigator as MediaSessionNavigator).mediaSession;
    if (!mediaSession?.setPositionState || nextDuration <= 0) return;

    try {
      mediaSession.setPositionState({
        duration: nextDuration,
        playbackRate: rateRef.current,
        position: Math.min(Math.max(nextTime, 0), nextDuration),
      });
    } catch {
      // Media Session position state is optional on some mobile browsers.
    }
  }, []);

  const seekTo = useCallback((nextTime: number) => {
    const audio = audioRef.current;
    const knownDuration = Number.isFinite(audio?.duration)
      ? audio?.duration ?? durationRef.current
      : durationRef.current;
    if (knownDuration <= 0) return;

    const clampedTime = Math.min(Math.max(nextTime, 0), Math.max(0, knownDuration - 0.25));
    if (audio) audio.currentTime = clampedTime;
    currentTimeRef.current = clampedTime;
    setCurrentTime(clampedTime);
    setHasSavedPosition(clampedTime > 0);
    persistProgress(episodeIndexRef.current, clampedTime, knownDuration);
    updateMediaPosition(clampedTime, knownDuration);
  }, [persistProgress, updateMediaPosition]);

  const playAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentAudio) return;

    setError(null);
    setIsLoading(true);
    audio.playbackRate = rateRef.current;
    try {
      await audio.play();
      isPlayingRef.current = true;
      setIsPlaying(true);
      setIsLoading(false);
      const mediaSession = (navigator as MediaSessionNavigator).mediaSession;
      if (mediaSession) mediaSession.playbackState = "playing";
    } catch {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setIsLoading(false);
      setError("Podcast 無法播放，請稍後再試或下載音檔。");
    }
  }, [currentAudio]);

  const pauseAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    isPlayingRef.current = false;
    setIsPlaying(false);
    persistProgress();
    const mediaSession = (navigator as MediaSessionNavigator).mediaSession;
    if (mediaSession) mediaSession.playbackState = "paused";
  }, [persistProgress]);

  const switchToEpisodePosition = useCallback((nextPosition: number, shouldPlay = false) => {
    const target = audioEpisodes[nextPosition];
    if (!target) return;

    const audio = audioRef.current;
    if (audio) {
      persistProgress(
        episodeIndexRef.current,
        audio.currentTime,
        Number.isFinite(audio.duration) ? audio.duration : durationRef.current,
      );
      audio.pause();
    }

    episodeIndexRef.current = target.chapterIndex;
    currentTimeRef.current = 0;
    durationRef.current = target.chapter.audio?.durationSeconds ?? 0;
    resumeAtRef.current = 0;
    autoplayAfterLoadRef.current = shouldPlay;
    isPlayingRef.current = false;
    setEpisodeIndex(target.chapterIndex);
    setCurrentTime(0);
    setDuration(durationRef.current);
    setHasSavedPosition(false);
    setIsPlaying(false);
    setIsLoading(shouldPlay);
    setError(null);
    persistProgress(target.chapterIndex, 0, durationRef.current);
  }, [audioEpisodes, persistProgress]);

  useEffect(() => {
    const key = `${progressKeyPrefix}:${book.slug}`;
    let stored: StoredBookProgress = {};
    try {
      stored = JSON.parse(window.localStorage.getItem(key) ?? "{}") as StoredBookProgress;
    } catch {
      window.localStorage.removeItem(key);
    }

    const storedEpisodeIndex =
      Number.isInteger(stored.podcastChapterIndex) &&
      book.chapters[stored.podcastChapterIndex ?? -1]?.audio?.src
        ? stored.podcastChapterIndex ?? firstEpisodeIndex
        : firstEpisodeIndex;
    const storedDuration =
      typeof stored.podcastDuration === "number" && stored.podcastDuration > 0
        ? stored.podcastDuration
        : book.chapters[storedEpisodeIndex]?.audio?.durationSeconds ?? 0;
    const storedTime =
      typeof stored.podcastCurrentTime === "number" && stored.podcastCurrentTime > 0
        ? Math.min(stored.podcastCurrentTime, storedDuration || Number.MAX_SAFE_INTEGER)
        : 0;
    const storedRate =
      typeof stored.podcastRate === "number" && podcastRates.includes(stored.podcastRate)
        ? stored.podcastRate
        : 1;
    const storedAutoAdvance = stored.autoAdvancePodcast !== false;

    episodeIndexRef.current = storedEpisodeIndex;
    currentTimeRef.current = storedTime;
    durationRef.current = storedDuration;
    resumeAtRef.current = storedTime;
    rateRef.current = storedRate;
    autoAdvanceRef.current = storedAutoAdvance;
    hydratedRef.current = true;

    const frame = window.requestAnimationFrame(() => {
      setEpisodeIndex(storedEpisodeIndex);
      setCurrentTime(storedTime);
      setDuration(storedDuration);
      setRate(storedRate);
      setAutoAdvance(storedAutoAdvance);
      setHasSavedPosition(storedTime > 0);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [book.chapters, book.slug, firstEpisodeIndex]);

  useEffect(() => {
    episodeIndexRef.current = episodeIndex;
  }, [episodeIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        persistProgress(
          episodeIndexRef.current,
          audio.currentTime,
          Number.isFinite(audio.duration) ? audio.duration : durationRef.current,
        );
        audio.pause();
      }
    };
  }, [persistProgress]);

  useEffect(() => {
    const saveCurrentPosition = () => {
      const audio = audioRef.current;
      if (audio && currentAudio) {
        currentTimeRef.current = audio.currentTime;
        durationRef.current = Number.isFinite(audio.duration) ? audio.duration : durationRef.current;
      }
      persistProgress();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") saveCurrentPosition();
    };

    window.addEventListener("pagehide", saveCurrentPosition);
    window.addEventListener("beforeunload", saveCurrentPosition);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", saveCurrentPosition);
      window.removeEventListener("beforeunload", saveCurrentPosition);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [currentAudio, persistProgress]);

  useEffect(() => {
    const mediaSession = (navigator as MediaSessionNavigator).mediaSession;
    if (!mediaSession || !currentChapter || !("MediaMetadata" in window)) return;

    mediaSession.metadata = new window.MediaMetadata({
      title: currentChapter.audio?.title ?? currentChapter.title,
      artist: book.author,
      album: book.title,
      artwork: [{ src: book.cover, sizes: "512x512", type: "image/png" }],
    });
    const setHandler = (
      action: MediaSessionAction,
      handler: MediaSessionActionHandler | null,
    ) => {
      try {
        mediaSession.setActionHandler(action, handler);
      } catch {
        // Not every browser implements every Media Session action.
      }
    };

    setHandler("play", () => void playAudio());
    setHandler("pause", pauseAudio);
    setHandler("seekbackward", (details) => seekTo(currentTimeRef.current - (details.seekOffset ?? 15)));
    setHandler("seekforward", (details) => seekTo(currentTimeRef.current + (details.seekOffset ?? 30)));
    setHandler("seekto", (details) => {
      if (details.seekTime !== undefined) seekTo(details.seekTime);
    });
    setHandler("previoustrack", () => switchToEpisodePosition(currentEpisodePosition - 1, true));
    setHandler("nexttrack", () => switchToEpisodePosition(currentEpisodePosition + 1, true));

    return () => {
      setHandler("play", null);
      setHandler("pause", null);
      setHandler("seekbackward", null);
      setHandler("seekforward", null);
      setHandler("seekto", null);
      setHandler("previoustrack", null);
      setHandler("nexttrack", null);
    };
  }, [
    book.author,
    book.cover,
    book.title,
    currentChapter,
    currentEpisodePosition,
    pauseAudio,
    playAudio,
    seekTo,
    switchToEpisodePosition,
  ]);

  function handleLoadedMetadata() {
    const audio = audioRef.current;
    if (!audio) return;
    const nextDuration = Number.isFinite(audio.duration)
      ? audio.duration
      : currentAudio?.durationSeconds ?? 0;
    const resumeTime = Math.min(
      resumeAtRef.current,
      nextDuration > 0 ? Math.max(0, nextDuration - 0.25) : resumeAtRef.current,
    );

    audio.playbackRate = rateRef.current;
    if (resumeTime > 0) audio.currentTime = resumeTime;
    currentTimeRef.current = resumeTime;
    durationRef.current = nextDuration;
    setCurrentTime(resumeTime);
    setDuration(nextDuration);
    setHasSavedPosition(resumeTime > 0);
    persistProgress(episodeIndexRef.current, resumeTime, nextDuration);
    updateMediaPosition(resumeTime, nextDuration);

    if (autoplayAfterLoadRef.current) {
      autoplayAfterLoadRef.current = false;
      void playAudio();
    } else {
      setIsLoading(false);
    }
  }

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio) return;
    const nextTime = audio.currentTime;
    const nextDuration = Number.isFinite(audio.duration) ? audio.duration : durationRef.current;
    currentTimeRef.current = nextTime;
    durationRef.current = nextDuration;
    setCurrentTime(nextTime);
    setDuration(nextDuration);
    setHasSavedPosition(nextTime > 0);
    updateMediaPosition(nextTime, nextDuration);

    const now = Date.now();
    if (now - lastPersistAtRef.current >= 1000) {
      lastPersistAtRef.current = now;
      persistProgress(episodeIndexRef.current, nextTime, nextDuration);
    }
  }

  function handleEnded() {
    isPlayingRef.current = false;
    setIsPlaying(false);
    setHasSavedPosition(false);
    currentTimeRef.current = 0;
    setCurrentTime(0);
    persistProgress(episodeIndexRef.current, 0, durationRef.current);
    if (autoAdvanceRef.current && nextEpisode) {
      switchToEpisodePosition(currentEpisodePosition + 1, true);
    }
  }

  function changeRate(nextRate: number) {
    rateRef.current = nextRate;
    setRate(nextRate);
    if (audioRef.current) audioRef.current.playbackRate = nextRate;
    persistProgress();
    updateMediaPosition(currentTimeRef.current, durationRef.current);
  }

  function toggleAutoAdvance() {
    const nextValue = !autoAdvanceRef.current;
    autoAdvanceRef.current = nextValue;
    setAutoAdvance(nextValue);
    persistProgress();
  }

  if (!currentChapter || !currentAudio || audioEpisodes.length === 0) {
    return (
      <main className="podcast-app podcast-app--empty">
        <header className="podcast-topbar">
          <Link aria-label="返回書庫" className="podcast-home-button" href="/">
            <Home aria-hidden="true" size={19} />
          </Link>
          <div className="podcast-brand">
            <Headphones aria-hidden="true" size={18} />
            <span>詩塾 Podcast</span>
          </div>
          <Link className="podcast-read-link" href={`/books/${book.slug}/read`}>
            <BookOpen aria-hidden="true" size={17} />
            閱讀電子書
          </Link>
        </header>
        <section className="podcast-empty-state">
          <Headphones aria-hidden="true" size={38} />
          <span>Podcast 尚未上線</span>
          <h1>{book.title}</h1>
          <p>這本書目前可先閱讀電子書，Podcast 完成後會出現在同一個入口。</p>
          <Link className="podcast-empty-read" href={`/books/${book.slug}/read`}>
            <BookOpen aria-hidden="true" size={18} />
            開始閱讀
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className={`podcast-app ${isPlaying ? "podcast-app--playing" : ""}`}>
      <header className="podcast-topbar">
        <Link aria-label="返回書庫" className="podcast-home-button" href="/" title="返回書庫">
          <Home aria-hidden="true" size={19} />
        </Link>
        <div className="podcast-brand">
          <Headphones aria-hidden="true" size={18} />
          <span>詩塾 Podcast</span>
          <small>{audioEpisodes.length} 集</small>
        </div>
        <Link className="podcast-read-link" href={`/books/${book.slug}/read`}>
          <BookOpen aria-hidden="true" size={17} />
          閱讀電子書
        </Link>
      </header>

      <div className="podcast-workspace">
        <aside className="podcast-book-card" aria-label="節目資訊">
          <div className="podcast-cover-wrap">
            <Image
              alt={`${book.title} 封面`}
              height={900}
              priority
              sizes="(max-width: 760px) 82px, 24vw"
              src={book.cover}
              width={600}
            />
            <span className="podcast-cover-live">
              <span aria-hidden="true" />
              {statusLabel}
            </span>
          </div>
          <div className="podcast-book-copy">
            <span className="podcast-kicker">NotebookLM Audio Series</span>
            <h1>{book.title}</h1>
            <p>{book.subtitle}</p>
            <div className="podcast-book-meta">
              <span>{book.author}</span>
              <span>{audioEpisodes.length}/{book.chapters.length} 集</span>
              <span>自動連播</span>
            </div>
          </div>
        </aside>

        <section
          aria-busy={isLoading}
          aria-labelledby="podcast-episode-title"
          className="podcast-player-card"
        >
          <div className="podcast-episode-head">
            <div>
              <span className="podcast-episode-number">
                EP {String(currentEpisodePosition + 1).padStart(2, "0")} / {String(audioEpisodes.length).padStart(2, "0")}
              </span>
              <h2 id="podcast-episode-title">{currentChapter.title}</h2>
              <p>{currentChapter.summary}</p>
            </div>
            <span aria-live="polite" className={`podcast-state podcast-state--${error ? "error" : isPlaying ? "playing" : "idle"}`}>
              {statusLabel}
            </span>
          </div>

          <label className="podcast-episode-select">
            <span>選擇單集</span>
            <select
              aria-label="選擇 Podcast 單集"
              onChange={(event) => {
                const nextIndex = Number(event.target.value);
                const nextPosition = audioEpisodes.findIndex((episode) => episode.chapterIndex === nextIndex);
                switchToEpisodePosition(nextPosition, false);
              }}
              value={episodeIndex}
            >
              {audioEpisodes.map(({ chapter, chapterIndex }, index) => (
                <option key={chapter.id} value={chapterIndex}>
                  {String(index + 1).padStart(2, "0")} · {chapter.title}
                </option>
              ))}
            </select>
          </label>

          <div className="podcast-timeline">
            <input
              aria-label={`Podcast 播放進度：${formatTime(currentTime)} / ${formatTime(duration)}`}
              aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
              className="podcast-timeline-slider"
              max={duration > 0 ? duration : 1}
              min={0}
              onChange={(event) => seekTo(Number(event.target.value))}
              step={1}
              style={{ "--podcast-progress": `${progressPercent}%` } as CSSProperties}
              type="range"
              value={Math.min(currentTime, duration > 0 ? duration : 1)}
            />
            <div className="podcast-time-row">
              <span>{formatTime(currentTime)}</span>
              <strong>{hasSavedPosition && !isPlaying ? "已保存，可繼續" : `${Math.round(progressPercent)}%`}</strong>
              <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
            </div>
          </div>

          <div aria-label="Podcast 播放控制" className="podcast-main-controls" role="group">
            <button
              aria-label="上一集"
              disabled={!previousEpisode}
              onClick={() => switchToEpisodePosition(currentEpisodePosition - 1, isPlayingRef.current)}
              title="上一集"
              type="button"
            >
              <SkipBack aria-hidden="true" size={21} />
            </button>
            <button aria-label="倒退 15 秒" onClick={() => seekTo(currentTimeRef.current - 15)} title="倒退 15 秒" type="button">
              <Rewind aria-hidden="true" size={21} />
              <small>15</small>
            </button>
            <button
              aria-label={isPlaying ? "暫停 Podcast" : hasSavedPosition ? "繼續 Podcast" : "播放 Podcast"}
              className="podcast-central-play"
              onClick={() => isPlaying ? pauseAudio() : void playAudio()}
              title={isPlaying ? "暫停" : "播放"}
              type="button"
            >
              {isLoading ? (
                <span aria-hidden="true" className="podcast-loading-ring" />
              ) : isPlaying ? (
                <Pause aria-hidden="true" size={30} />
              ) : (
                <Play aria-hidden="true" size={30} />
              )}
            </button>
            <button aria-label="快進 30 秒" onClick={() => seekTo(currentTimeRef.current + 30)} title="快進 30 秒" type="button">
              <FastForward aria-hidden="true" size={21} />
              <small>30</small>
            </button>
            <button
              aria-label="下一集"
              disabled={!nextEpisode}
              onClick={() => switchToEpisodePosition(currentEpisodePosition + 1, isPlayingRef.current)}
              title="下一集"
              type="button"
            >
              <SkipForward aria-hidden="true" size={21} />
            </button>
          </div>

          <div aria-label="Podcast 播放設定" className="podcast-secondary-controls" role="group">
            <label className="podcast-speed-control">
              <span>速度</span>
              <select aria-label="Podcast 播放速度" onChange={(event) => changeRate(Number(event.target.value))} value={rate}>
                {podcastRates.map((option) => (
                  <option key={option} value={option}>{option}x</option>
                ))}
              </select>
            </label>
            <button
              aria-checked={autoAdvance}
              className={`podcast-autonext ${autoAdvance ? "is-on" : ""}`}
              onClick={toggleAutoAdvance}
              role="switch"
              type="button"
            >
              <span aria-hidden="true" />
              自動下一集
            </button>
            <a className="podcast-download" download href={currentAudio.src}>
              <Download aria-hidden="true" size={17} />
              下載
            </a>
          </div>

          <div className="podcast-up-next" aria-live="polite">
            <span>{autoAdvance ? "接著播放" : "自動連播已關閉"}</span>
            <strong>{autoAdvance && nextEpisode ? nextEpisode.chapter.title : "本集播放完畢後停止"}</strong>
          </div>
          {error && <p className="podcast-player-error" role="alert">{error}</p>}
        </section>
      </div>

      <footer className="podcast-footer">
        <span>進度會自動保存在這台裝置</span>
        <Link href={`/books/${book.slug}/read`}>
          想看文字？前往電子書
          <BookOpen aria-hidden="true" size={15} />
        </Link>
      </footer>

      <audio
        className="podcast-audio-engine"
        onEnded={handleEnded}
        onError={() => {
          setIsLoading(false);
          setIsPlaying(false);
          setError("音檔載入失敗，請使用下載連結或稍後再試。");
        }}
        onLoadedMetadata={handleLoadedMetadata}
        onPause={() => {
          if (!audioRef.current) return;
          isPlayingRef.current = false;
          setIsPlaying(false);
          persistProgress(
            episodeIndexRef.current,
            audioRef.current.currentTime,
            Number.isFinite(audioRef.current.duration) ? audioRef.current.duration : durationRef.current,
          );
        }}
        onPlay={() => {
          isPlayingRef.current = true;
          setIsPlaying(true);
          setIsLoading(false);
        }}
        onTimeUpdate={handleTimeUpdate}
        preload="metadata"
        ref={audioRef}
        src={currentAudio.src}
      />
    </main>
  );
}
