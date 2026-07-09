"use client";

import {
  BookmarkCheck,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  Headphones,
  Home,
  List,
  Minus,
  Pause,
  Play,
  Plus,
  SkipBack,
  SkipForward,
  Sparkles,
  Square,
  Volume2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getBookStats, type Book } from "@/lib/books";

type BookReaderProps = {
  book: Book;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type WakeLockSentinelLike = {
  release: () => Promise<void>;
  addEventListener?: (type: "release", listener: () => void) => void;
  removeEventListener?: (type: "release", listener: () => void) => void;
};

type NavigatorWithWakeLock = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinelLike>;
  };
};

type NavigatorWithMediaSession = Navigator & {
  mediaSession?: MediaSession;
};

type SavedReaderProgress = {
  version?: number;
  chapterIndex?: number;
  paragraphIndex?: number;
  paragraphId?: string;
  scrollOffset?: number;
  fontScale?: number;
  speechRate?: number;
  podcastRate?: number;
  autoAdvancePodcast?: boolean;
  updatedAt?: number;
};

type AudioProgress = {
  currentTime: number;
  duration: number;
};

const progressKeyPrefix = "book-reader-progress";
const narrationRates = [0.75, 1, 1.25, 1.5, 2];
const podcastRates = [1, 1.25, 1.5, 1.75, 2, 2.5];
const subheadingPattern =
  /^(開場|前言|序言|導讀|結語|結論|總結|小結|後記|終章|附錄|延伸補充|核心命題|核心概念|案例|練習|實作|問答|重點整理)$|^第\s*[一二三四五六七八九十百千\d]+\s*[講章节章課部]\b|^[一二三四五六七八九十]+、.+|^\d+(\.\d+)+\s+.+|^\d+[、.]\s*.+/;

function getParagraphId(chapterId: string, index: number) {
  return `chapter-${chapterId}-paragraph-${index}`;
}

function isSubheading(paragraph: string, index: number) {
  const text = paragraph.trim();
  return text.length <= 80 && (index > 0 || /^(開場|前言|序言|導讀)$/.test(text)) && subheadingPattern.test(text);
}

function formatAudioTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const remainder = String(wholeSeconds % 60).padStart(2, "0");
  return `${minutes}:${remainder}`;
}

export function BookReader({ book }: BookReaderProps) {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [fontScale, setFontScale] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [podcastRate, setPodcastRate] = useState(1);
  const [autoAdvancePodcast, setAutoAdvancePodcast] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isNarrationPaused, setIsNarrationPaused] = useState(false);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number | null>(null);
  const [activeAudioChapterIndex, setActiveAudioChapterIndex] = useState<number | null>(null);
  const [audioProgress, setAudioProgress] = useState<AudioProgress>({
    currentTime: 0,
    duration: 0,
  });
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [bookmarkNotice, setBookmarkNotice] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const paragraphIndexRef = useRef(0);
  const manuallyStoppedRef = useRef(false);
  const activeParagraphRef = useRef<number | null>(null);
  const activeAudioChapterRef = useRef<number | null>(null);
  const chapterIndexRef = useRef(0);
  const speechRateRef = useRef(1);
  const podcastRateRef = useRef(1);
  const autoAdvancePodcastRef = useRef(true);
  const speechRunRef = useRef(0);
  const wakeLockRef = useRef<WakeLockSentinelLike | null>(null);
  const wakeLockReleaseHandlerRef = useRef<(() => void) | null>(null);
  const readingPositionRef = useRef({
    chapterIndex: 0,
    paragraphIndex: 0,
    paragraphId: "",
    scrollOffset: 0,
  });
  const progressLoadedRef = useRef(false);
  const restoreTargetRef = useRef<{
    chapterIndex: number;
    paragraphIndex: number;
    paragraphId: string;
    scrollOffset: number;
  } | null>(null);
  const progressSaveTimerRef = useRef<number | null>(null);

  const chapter = book.chapters[chapterIndex];
  const stats = useMemo(() => getBookStats(book), [book]);
  const progressKey = `${progressKeyPrefix}:${book.slug}`;
  const progress = Math.round(((chapterIndex + 1) / book.chapters.length) * 100);
  const chapterAudio = chapter.audio?.src ? chapter.audio : null;
  const hasChapterAudio = Boolean(chapterAudio);
  const isPodcastActive = activeAudioChapterIndex !== null;
  const isCurrentPodcastActive = activeAudioChapterIndex === chapterIndex;
  const isSpeechNarrationActive = isNarrating && !isPodcastActive;
  const audioProgressPercent =
    audioProgress.duration > 0
      ? Math.min(100, Math.round((audioProgress.currentTime / audioProgress.duration) * 100))
      : 0;
  const narrationProgress =
    activeParagraphIndex === null
      ? 0
      : Math.round(((activeParagraphIndex + 1) / chapter.paragraphs.length) * 100);
  const podcastProgress = isCurrentPodcastActive ? audioProgressPercent : 0;
  const speechControlsDisabled = !speechSupported || isPodcastActive;
  const playbackModeLabel = "朗讀";
  const playbackDetail = activeParagraphIndex === null
      ? "尚未開始"
      : `第 ${activeParagraphIndex + 1} / ${chapter.paragraphs.length} 段`;
  const podcastTitle = chapterAudio?.title ?? `第 ${chapter.number} 章 Podcast`;
  const podcastDetail =
    hasChapterAudio && isCurrentPodcastActive && audioProgress.duration > 0
      ? `${formatAudioTime(audioProgress.currentTime)} / ${formatAudioTime(audioProgress.duration)}`
      : hasChapterAudio
        ? podcastTitle
        : "本章尚未匯入 NotebookLM Podcast";
  const podcastAutoAdvanceLabel = autoAdvancePodcast ? "自動下一章" : "本章播放";
  const podcastPlayLabel =
    isCurrentPodcastActive && isNarrating && !isNarrationPaused
      ? "暫停 Podcast"
      : isCurrentPodcastActive && isNarrationPaused
        ? "繼續 Podcast"
        : "播放 Podcast";
  const hasPreviousPodcast = Boolean(book.chapters[chapterIndex - 1]?.audio?.src);
  const hasNextPodcast = Boolean(book.chapters[chapterIndex + 1]?.audio?.src);

  const scrollToParagraph = useCallback((chapterId: string, index: number) => {
    window.requestAnimationFrame(() => {
      document
        .getElementById(getParagraphId(chapterId, index))
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, []);

  const scrollToPodcastPanel = useCallback(() => {
    window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(".podcast-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const updateReadingPosition = useCallback((
    nextChapterIndex: number,
    nextParagraphIndex: number,
    element?: HTMLElement | null,
  ) => {
    const nextChapter = book.chapters[nextChapterIndex];
    if (!nextChapter) return;

    const paragraphIndex = Math.min(
      Math.max(nextParagraphIndex, 0),
      Math.max(nextChapter.paragraphs.length - 1, 0),
    );
    const paragraphId = getParagraphId(nextChapter.id, paragraphIndex);
    const targetElement = element ?? document.getElementById(paragraphId);
    const targetTop = targetElement
      ? targetElement.getBoundingClientRect().top + window.scrollY
      : window.scrollY;

    readingPositionRef.current = {
      chapterIndex: nextChapterIndex,
      paragraphIndex,
      paragraphId,
      scrollOffset: Math.max(0, Math.round(window.scrollY - targetTop)),
    };
  }, [book.chapters]);

  const captureReadingPosition = useCallback(() => {
    const blocks = Array.from(
      document.querySelectorAll<HTMLElement>(".book-prose .readable-block[data-paragraph-index]"),
    );
    if (blocks.length === 0) {
      updateReadingPosition(chapterIndexRef.current, 0);
      return;
    }

    const anchorY = Math.min(window.innerHeight * 0.35, 260);
    let selected = blocks[0];

    for (const block of blocks) {
      const rect = block.getBoundingClientRect();
      if (rect.top <= anchorY) {
        selected = block;
      } else if (selected === blocks[0] && rect.top >= 0) {
        selected = block;
        break;
      } else {
        break;
      }
    }

    const nextParagraphIndex = Number(selected.dataset.paragraphIndex);
    if (Number.isInteger(nextParagraphIndex)) {
      updateReadingPosition(chapterIndexRef.current, nextParagraphIndex, selected);
    }
  }, [updateReadingPosition]);

  const persistProgress = useCallback((overrides: Partial<SavedReaderProgress> = {}) => {
    if (!progressLoadedRef.current) return;

    const currentPosition = readingPositionRef.current;
    const nextChapterIndex = overrides.chapterIndex ?? currentPosition.chapterIndex ?? chapterIndexRef.current;
    const nextChapter = book.chapters[nextChapterIndex] ?? book.chapters[0];
    if (!nextChapter) return;

    const fallbackParagraphIndex = currentPosition.chapterIndex === nextChapterIndex
      ? currentPosition.paragraphIndex
      : 0;
    const paragraphIndex = Math.min(
      Math.max(overrides.paragraphIndex ?? fallbackParagraphIndex ?? 0, 0),
      Math.max(nextChapter.paragraphs.length - 1, 0),
    );
    const paragraphId = overrides.paragraphId ?? getParagraphId(nextChapter.id, paragraphIndex);
    const scrollOffset = Math.max(0, Math.round(overrides.scrollOffset ?? currentPosition.scrollOffset ?? 0));

    window.localStorage.setItem(
      progressKey,
      JSON.stringify({
        version: 2,
        chapterIndex: nextChapterIndex,
        paragraphIndex,
        paragraphId,
        scrollOffset,
        fontScale,
        speechRate,
        podcastRate,
        autoAdvancePodcast,
        updatedAt: Date.now(),
      }),
    );
  }, [autoAdvancePodcast, book.chapters, fontScale, podcastRate, progressKey, speechRate]);

  const scheduleProgressSave = useCallback(() => {
    if (!progressLoadedRef.current) return;
    if (progressSaveTimerRef.current !== null) {
      window.clearTimeout(progressSaveTimerRef.current);
    }

    progressSaveTimerRef.current = window.setTimeout(() => {
      progressSaveTimerRef.current = null;
      persistProgress();
    }, 240);
  }, [persistProgress]);

  const requestNarrationWakeLock = useCallback(async () => {
    const wakeLock = (navigator as NavigatorWithWakeLock).wakeLock;
    if (!wakeLock || wakeLockRef.current) return;

    try {
      const sentinel = await wakeLock.request("screen");
      const onRelease = () => {
        wakeLockRef.current = null;
        wakeLockReleaseHandlerRef.current = null;
      };
      wakeLockRef.current = sentinel;
      wakeLockReleaseHandlerRef.current = onRelease;
      sentinel.addEventListener?.("release", onRelease);
    } catch {
      wakeLockRef.current = null;
      wakeLockReleaseHandlerRef.current = null;
    }
  }, []);

  const releaseNarrationWakeLock = useCallback(() => {
    const sentinel = wakeLockRef.current;
    if (!sentinel) return;

    const onRelease = wakeLockReleaseHandlerRef.current;
    if (onRelease) sentinel.removeEventListener?.("release", onRelease);
    wakeLockRef.current = null;
    wakeLockReleaseHandlerRef.current = null;
    sentinel.release().catch(() => undefined);
  }, []);

  const setMediaSessionState = useCallback((state: MediaSessionPlaybackState) => {
    const mediaSession = (navigator as NavigatorWithMediaSession).mediaSession;
    if (!mediaSession) return;

    mediaSession.playbackState = state;
  }, []);

  const updateMediaSessionMetadata = useCallback((nextChapterIndex: number) => {
    const mediaSession = (navigator as NavigatorWithMediaSession).mediaSession;
    const nextChapter = book.chapters[nextChapterIndex];
    if (!mediaSession || !nextChapter || !("MediaMetadata" in window)) return;

    mediaSession.metadata = new window.MediaMetadata({
      title: nextChapter.title,
      artist: book.author,
      album: book.title,
      artwork: [
        { src: book.cover, sizes: "512x512", type: "image/png" },
      ],
    });
  }, [book.author, book.chapters, book.cover, book.title]);

  const stopNarration = useCallback(() => {
    manuallyStoppedRef.current = true;
    speechRunRef.current += 1;
    releaseNarrationWakeLock();

    const audio = audioElementRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();
      window.setTimeout(() => window.speechSynthesis.cancel(), 0);
      window.setTimeout(() => window.speechSynthesis.cancel(), 120);
    }

    setIsNarrating(false);
    setIsNarrationPaused(false);
    setActiveParagraphIndex(null);
    setActiveAudioChapterIndex(null);
    setAudioProgress({ currentTime: 0, duration: 0 });
    setAudioError(null);
    activeParagraphRef.current = null;
    activeAudioChapterRef.current = null;
    setMediaSessionState("none");
  }, [releaseNarrationWakeLock, setMediaSessionState]);

  const playChapterAudio = useCallback((nextChapterIndex: number) => {
    const nextChapter = book.chapters[nextChapterIndex];
    const audioSrc = nextChapter?.audio?.src;
    const audio = audioElementRef.current;

    if (!nextChapter || !audioSrc) {
      setAudioError("此章尚未有音檔");
      return;
    }

    if (!audio) {
      setAudioError("音訊播放器尚未準備好");
      return;
    }

    manuallyStoppedRef.current = false;
    speechRunRef.current += 1;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();
    }

    audio.pause();
    audio.src = audioSrc;
    audio.playbackRate = podcastRateRef.current;

    chapterIndexRef.current = nextChapterIndex;
    paragraphIndexRef.current = 0;
    activeParagraphRef.current = null;
    activeAudioChapterRef.current = nextChapterIndex;
    updateReadingPosition(nextChapterIndex, 0);
    setChapterIndex(nextChapterIndex);
    setActiveParagraphIndex(null);
    setActiveAudioChapterIndex(nextChapterIndex);
    setAudioProgress({ currentTime: 0, duration: 0 });
    setAudioError(null);
    setSpeechError(null);
    setIsNarrating(true);
    setIsNarrationPaused(false);
    updateMediaSessionMetadata(nextChapterIndex);
    setMediaSessionState("playing");
    requestNarrationWakeLock();
    scrollToPodcastPanel();
    persistProgress({
      chapterIndex: nextChapterIndex,
      paragraphIndex: 0,
      paragraphId: getParagraphId(nextChapter.id, 0),
      scrollOffset: 0,
    });

    audio.play().catch(() => {
      releaseNarrationWakeLock();
      setAudioError("音檔無法播放，請確認檔案已放在 public 資料夾並可被瀏覽器讀取");
      setIsNarrating(false);
      setIsNarrationPaused(false);
      setActiveAudioChapterIndex(null);
      activeAudioChapterRef.current = null;
      setMediaSessionState("none");
    });
  }, [
    book.chapters,
    persistProgress,
    releaseNarrationWakeLock,
    requestNarrationWakeLock,
    scrollToPodcastPanel,
    setMediaSessionState,
    updateReadingPosition,
    updateMediaSessionMetadata,
  ]);

  const speakFromLocation = useCallback((startChapterIndex: number, startIndex: number, nextRate = speechRateRef.current) => {
    if (!("speechSynthesis" in window)) {
      setSpeechError("此瀏覽器不支援朗讀");
      return;
    }

    const startChapter = book.chapters[startChapterIndex];
    const paragraphs = startChapter?.paragraphs ?? [];
    if (paragraphs.length === 0) return;

    const clampedIndex = Math.min(Math.max(startIndex, 0), paragraphs.length - 1);
    manuallyStoppedRef.current = false;
    const speechRun = speechRunRef.current + 1;
    speechRunRef.current = speechRun;
    speechRateRef.current = nextRate;
    const audio = audioElementRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    activeAudioChapterRef.current = null;
    setActiveAudioChapterIndex(null);
    setAudioProgress({ currentTime: 0, duration: 0 });
    setAudioError(null);
    requestNarrationWakeLock();
    window.speechSynthesis.resume();
    window.speechSynthesis.cancel();
    setSpeechError(null);
    setIsNarrating(true);
    setIsNarrationPaused(false);
    setMediaSessionState("playing");

    const finishNarration = () => {
      releaseNarrationWakeLock();
      setIsNarrating(false);
      setIsNarrationPaused(false);
      setActiveParagraphIndex(null);
      activeParagraphRef.current = null;
      setMediaSessionState("none");
    };

    const speakAt = (nextChapterIndex: number, index: number) => {
      if (manuallyStoppedRef.current || speechRunRef.current !== speechRun) return;

      const nextChapter = book.chapters[nextChapterIndex];
      if (!nextChapter) {
        finishNarration();
        return;
      }

      if (index >= nextChapter.paragraphs.length) {
        const followingChapterIndex = nextChapterIndex + 1;
        const followingChapter = book.chapters[followingChapterIndex];
        if (!followingChapter) {
          finishNarration();
          return;
        }

        chapterIndexRef.current = followingChapterIndex;
        paragraphIndexRef.current = 0;
        activeParagraphRef.current = 0;
        updateReadingPosition(followingChapterIndex, 0);
        setChapterIndex(followingChapterIndex);
        updateMediaSessionMetadata(followingChapterIndex);
        persistProgress({
          chapterIndex: followingChapterIndex,
          paragraphIndex: 0,
          paragraphId: getParagraphId(followingChapter.id, 0),
          scrollOffset: 0,
        });
        window.setTimeout(() => {
          if (!manuallyStoppedRef.current && speechRunRef.current === speechRun) {
            speakAt(followingChapterIndex, 0);
          }
        }, 80);
        return;
      }

      const paragraph = nextChapter.paragraphs[index];
      if (!paragraph) {
        releaseNarrationWakeLock();
        setIsNarrating(false);
        setIsNarrationPaused(false);
        setActiveParagraphIndex(null);
        activeParagraphRef.current = null;
        setMediaSessionState("none");
        return;
      }

      chapterIndexRef.current = nextChapterIndex;
      paragraphIndexRef.current = index;
      activeParagraphRef.current = index;
      setChapterIndex(nextChapterIndex);
      setActiveParagraphIndex(index);
      updateReadingPosition(nextChapterIndex, index);
      updateMediaSessionMetadata(nextChapterIndex);
      scrollToParagraph(nextChapter.id, index);
      persistProgress({
        chapterIndex: nextChapterIndex,
        paragraphIndex: index,
        paragraphId: getParagraphId(nextChapter.id, index),
        scrollOffset: 0,
      });

      const utterance = new SpeechSynthesisUtterance(paragraph);
      utterance.lang = "zh-TW";
      utterance.rate = nextRate;
      utterance.pitch = 1;

      const voice = window.speechSynthesis
        .getVoices()
        .find((item) => item.lang.toLowerCase().startsWith("zh"));
      if (voice) utterance.voice = voice;

      utterance.onend = () => {
        if (!manuallyStoppedRef.current && speechRunRef.current === speechRun) {
          speakAt(nextChapterIndex, index + 1);
        }
      };

      utterance.onerror = () => {
        if (manuallyStoppedRef.current || speechRunRef.current !== speechRun) return;
        releaseNarrationWakeLock();
        setSpeechError("朗讀中斷，請再試一次");
        setIsNarrating(false);
        setIsNarrationPaused(false);
        setMediaSessionState("none");
      };

      window.speechSynthesis.speak(utterance);
    };

    chapterIndexRef.current = startChapterIndex;
    setChapterIndex(startChapterIndex);
    updateMediaSessionMetadata(startChapterIndex);
    speakAt(startChapterIndex, clampedIndex);
  }, [
    book.chapters,
    releaseNarrationWakeLock,
    requestNarrationWakeLock,
    scrollToParagraph,
    setMediaSessionState,
    persistProgress,
    updateReadingPosition,
    updateMediaSessionMetadata,
  ]);

  const speakFromParagraph = useCallback((startIndex: number, nextRate = speechRateRef.current) => {
    speakFromLocation(chapterIndexRef.current, startIndex, nextRate);
  }, [speakFromLocation]);

  const selectChapter = useCallback((nextIndex: number) => {
    stopNarration();
    const nextChapter = book.chapters[nextIndex];
    if (nextChapter) {
      chapterIndexRef.current = nextIndex;
      paragraphIndexRef.current = 0;
      activeParagraphRef.current = 0;
      updateReadingPosition(nextIndex, 0);
      persistProgress({
        chapterIndex: nextIndex,
        paragraphIndex: 0,
        paragraphId: getParagraphId(nextChapter.id, 0),
        scrollOffset: 0,
      });
    }
    setChapterIndex(nextIndex);
    setIsMenuOpen(false);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }, [book.chapters, persistProgress, stopNarration, updateReadingPosition]);

  const goNext = useCallback(() => {
    stopNarration();
    const nextIndex = Math.min(chapterIndexRef.current + 1, book.chapters.length - 1);
    const nextChapter = book.chapters[nextIndex];
    if (nextChapter) {
      chapterIndexRef.current = nextIndex;
      paragraphIndexRef.current = 0;
      activeParagraphRef.current = 0;
      updateReadingPosition(nextIndex, 0);
      persistProgress({
        chapterIndex: nextIndex,
        paragraphIndex: 0,
        paragraphId: getParagraphId(nextChapter.id, 0),
        scrollOffset: 0,
      });
    }
    setChapterIndex(nextIndex);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }, [book.chapters, persistProgress, stopNarration, updateReadingPosition]);

  const goPrevious = useCallback(() => {
    stopNarration();
    const nextIndex = Math.max(chapterIndexRef.current - 1, 0);
    const nextChapter = book.chapters[nextIndex];
    if (nextChapter) {
      chapterIndexRef.current = nextIndex;
      paragraphIndexRef.current = 0;
      activeParagraphRef.current = 0;
      updateReadingPosition(nextIndex, 0);
      persistProgress({
        chapterIndex: nextIndex,
        paragraphIndex: 0,
        paragraphId: getParagraphId(nextChapter.id, 0),
        scrollOffset: 0,
      });
    }
    setChapterIndex(nextIndex);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }, [book.chapters, persistProgress, stopNarration, updateReadingPosition]);

  function toggleNarration() {
    if (activeAudioChapterRef.current !== null) {
      return;
    }

    if (!isNarrating) {
      speakFromParagraph(activeParagraphRef.current ?? 0);
      return;
    }

    if (!("speechSynthesis" in window)) return;

    if (isNarrationPaused) {
      window.speechSynthesis.resume();
      setIsNarrationPaused(false);
      setMediaSessionState("playing");
      return;
    }

    window.speechSynthesis.pause();
    setIsNarrationPaused(true);
    setMediaSessionState("paused");
  }

  function togglePodcast() {
    if (!hasChapterAudio) return;

    const audio = audioElementRef.current;
    if (!isNarrating || activeAudioChapterIndex !== chapterIndex) {
      playChapterAudio(chapterIndex);
      return;
    }

    if (!audio) return;

    if (isNarrationPaused || audio.paused) {
      audio.play().then(() => {
        requestNarrationWakeLock();
        setIsNarrationPaused(false);
        setMediaSessionState("playing");
      }).catch(() => {
        setAudioError("Podcast 無法繼續播放");
        setIsNarrationPaused(true);
        setMediaSessionState("paused");
      });
      return;
    }

    audio.pause();
    setIsNarrationPaused(true);
    setMediaSessionState("paused");
  }

  function changeRate(nextRate: number) {
    setSpeechRate(nextRate);
    if (activeAudioChapterIndex !== null) {
      const audio = audioElementRef.current;
      if (audio) audio.playbackRate = nextRate;
      return;
    }

    if (isNarrating) {
      window.requestAnimationFrame(() => {
        speakFromParagraph(paragraphIndexRef.current, nextRate);
      });
    }
  }

  function changePodcastRate(nextRate: number) {
    setPodcastRate(nextRate);
    podcastRateRef.current = nextRate;
    const audio = audioElementRef.current;
    if (activeAudioChapterRef.current !== null && audio) {
      audio.playbackRate = nextRate;
    }
  }

  function toggleAutoAdvancePodcast() {
    setAutoAdvancePodcast((value) => {
      const nextValue = !value;
      autoAdvancePodcastRef.current = nextValue;
      return nextValue;
    });
  }

  const goToNarrationParagraph = useCallback((offset: number) => {
    let nextChapterIndex = chapterIndexRef.current;
    let nextIndex = (activeParagraphRef.current ?? paragraphIndexRef.current) + offset;

    if (nextIndex < 0 && nextChapterIndex > 0) {
      nextChapterIndex -= 1;
      nextIndex = book.chapters[nextChapterIndex].paragraphs.length - 1;
    } else if (
      nextIndex >= book.chapters[nextChapterIndex].paragraphs.length &&
      nextChapterIndex < book.chapters.length - 1
    ) {
      nextChapterIndex += 1;
      nextIndex = 0;
    } else {
      nextIndex = Math.min(
        Math.max(nextIndex, 0),
        book.chapters[nextChapterIndex].paragraphs.length - 1,
      );
    }

    if (isNarrating) {
      speakFromLocation(nextChapterIndex, nextIndex);
      return;
    }

    chapterIndexRef.current = nextChapterIndex;
    paragraphIndexRef.current = nextIndex;
    activeParagraphRef.current = nextIndex;
    setChapterIndex(nextChapterIndex);
    setActiveParagraphIndex(nextIndex);
    scrollToParagraph(book.chapters[nextChapterIndex].id, nextIndex);
    updateReadingPosition(nextChapterIndex, nextIndex);
    persistProgress({
      chapterIndex: nextChapterIndex,
      paragraphIndex: nextIndex,
      paragraphId: getParagraphId(book.chapters[nextChapterIndex].id, nextIndex),
      scrollOffset: 0,
    });
  }, [
    book.chapters,
    isNarrating,
    persistProgress,
    scrollToParagraph,
    speakFromLocation,
    updateReadingPosition,
  ]);

  const goToAudioChapter = useCallback((offset: number) => {
    const currentIndex = activeAudioChapterRef.current ?? chapterIndexRef.current;
    const nextChapterIndex = Math.min(
      Math.max(currentIndex + offset, 0),
      book.chapters.length - 1,
    );
    const nextChapter = book.chapters[nextChapterIndex];

    if (!nextChapter?.audio?.src) {
      setAudioError("這一章尚未有音檔");
      return;
    }

    if (isNarrating || activeAudioChapterRef.current !== null) {
      playChapterAudio(nextChapterIndex);
      return;
    }

    chapterIndexRef.current = nextChapterIndex;
    paragraphIndexRef.current = 0;
    activeParagraphRef.current = null;
    updateReadingPosition(nextChapterIndex, 0);
    setChapterIndex(nextChapterIndex);
    setActiveParagraphIndex(null);
    setAudioError(null);
    persistProgress({
      chapterIndex: nextChapterIndex,
      paragraphIndex: 0,
      paragraphId: getParagraphId(nextChapter.id, 0),
      scrollOffset: 0,
    });
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }, [
    book.chapters,
    isNarrating,
    persistProgress,
    playChapterAudio,
    updateReadingPosition,
  ]);

  const goToNarrationStep = useCallback((offset: number) => {
    if (activeAudioChapterRef.current !== null) {
      goToAudioChapter(offset);
      return;
    }

    goToNarrationParagraph(offset);
  }, [goToAudioChapter, goToNarrationParagraph]);

  function saveBookmark() {
    captureReadingPosition();
    persistProgress();
    const savedParagraphNumber = readingPositionRef.current.paragraphIndex + 1;
    setBookmarkNotice(`已保存：第 ${chapter.number} 章，第 ${savedParagraphNumber} 段`);
    window.setTimeout(() => setBookmarkNotice(null), 2200);
  }

  useEffect(() => {
    const saved = window.localStorage.getItem(progressKey);
    let loadTimer: number | null = null;
    let restoreFrame: number | null = null;

    const enableProgressSaving = () => {
      loadTimer = window.setTimeout(() => {
        progressLoadedRef.current = true;
      }, 0);
    };

    if (!saved) {
      const firstChapter = book.chapters[0];
      readingPositionRef.current = {
        chapterIndex: 0,
        paragraphIndex: 0,
        paragraphId: firstChapter ? getParagraphId(firstChapter.id, 0) : "",
        scrollOffset: 0,
      };
      enableProgressSaving();
      return () => {
        if (loadTimer !== null) window.clearTimeout(loadTimer);
        if (restoreFrame !== null) window.cancelAnimationFrame(restoreFrame);
      };
    }

    try {
      const parsed = JSON.parse(saved) as SavedReaderProgress;
      const savedChapterIndex =
        Number.isInteger(parsed.chapterIndex) && book.chapters[parsed.chapterIndex ?? -1]
          ? parsed.chapterIndex ?? 0
          : 0;
      const savedChapter = book.chapters[savedChapterIndex];
      const savedParagraphIndex =
        Number.isInteger(parsed.paragraphIndex) &&
        savedChapter?.paragraphs[parsed.paragraphIndex ?? -1]
          ? parsed.paragraphIndex ?? 0
          : 0;
      const paragraphId = savedChapter
        ? getParagraphId(savedChapter.id, savedParagraphIndex)
        : "";
      const scrollOffset =
        typeof parsed.scrollOffset === "number" && Number.isFinite(parsed.scrollOffset)
          ? Math.max(0, Math.round(parsed.scrollOffset))
          : 0;

      chapterIndexRef.current = savedChapterIndex;
      paragraphIndexRef.current = savedParagraphIndex;
      readingPositionRef.current = {
        chapterIndex: savedChapterIndex,
        paragraphIndex: savedParagraphIndex,
        paragraphId,
        scrollOffset,
      };
      restoreTargetRef.current = {
        chapterIndex: savedChapterIndex,
        paragraphIndex: savedParagraphIndex,
        paragraphId,
        scrollOffset,
      };
      restoreFrame = window.requestAnimationFrame(() => {
        setChapterIndex(savedChapterIndex);

        if (typeof parsed.fontScale === "number") {
          setFontScale(Math.min(1.18, Math.max(0.92, parsed.fontScale ?? 1)));
        }
        if (typeof parsed.speechRate === "number") {
          const savedSpeechRate = parsed.speechRate;
          setSpeechRate(narrationRates.includes(savedSpeechRate) ? savedSpeechRate : 1);
        }
        if (typeof parsed.podcastRate === "number") {
          const savedPodcastRate = parsed.podcastRate;
          const nextPodcastRate = podcastRates.includes(savedPodcastRate) ? savedPodcastRate : 1;
          podcastRateRef.current = nextPodcastRate;
          setPodcastRate(nextPodcastRate);
        }
        if (typeof parsed.autoAdvancePodcast === "boolean") {
          autoAdvancePodcastRef.current = parsed.autoAdvancePodcast;
          setAutoAdvancePodcast(parsed.autoAdvancePodcast);
        }
      });
    } catch {
      window.localStorage.removeItem(progressKey);
    }

    enableProgressSaving();
    return () => {
      if (loadTimer !== null) window.clearTimeout(loadTimer);
      if (restoreFrame !== null) window.cancelAnimationFrame(restoreFrame);
    };
  }, [book.chapters, progressKey]);

  useEffect(() => {
    const restoreTarget = restoreTargetRef.current;
    if (!restoreTarget || restoreTarget.chapterIndex !== chapterIndex) return;

    let attempts = 0;
    let frame = 0;

    const restoreScroll = () => {
      const target = restoreTargetRef.current;
      if (!target) return;

      const element =
        document.getElementById(target.paragraphId) ??
        document.getElementById(getParagraphId(book.chapters[chapterIndex]?.id ?? "", target.paragraphIndex));

      if (element) {
        const top = element.getBoundingClientRect().top + window.scrollY + target.scrollOffset;
        window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
        updateReadingPosition(target.chapterIndex, target.paragraphIndex, element);
        restoreTargetRef.current = null;
        return;
      }

      attempts += 1;
      if (attempts < 8) {
        frame = window.requestAnimationFrame(restoreScroll);
      } else {
        restoreTargetRef.current = null;
      }
    };

    frame = window.requestAnimationFrame(restoreScroll);
    return () => window.cancelAnimationFrame(frame);
  }, [book.chapters, chapterIndex, updateReadingPosition]);

  useEffect(() => {
    chapterIndexRef.current = chapterIndex;
  }, [chapterIndex]);

  useEffect(() => {
    speechRateRef.current = speechRate;
  }, [speechRate]);

  useEffect(() => {
    podcastRateRef.current = podcastRate;
    const audio = audioElementRef.current;
    if (activeAudioChapterRef.current !== null && audio) {
      audio.playbackRate = podcastRate;
    }
  }, [podcastRate]);

  useEffect(() => {
    autoAdvancePodcastRef.current = autoAdvancePodcast;
  }, [autoAdvancePodcast]);

  useEffect(() => {
    activeAudioChapterRef.current = activeAudioChapterIndex;
  }, [activeAudioChapterIndex]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioElementRef.current = audio;

    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audioElementRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioElementRef.current;
    if (!audio) return;

    const updateAudioProgress = () => {
      setAudioProgress({
        currentTime: audio.currentTime,
        duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      });
    };

    const finishAudioPlayback = (message?: string) => {
      releaseNarrationWakeLock();
      setIsNarrating(false);
      setIsNarrationPaused(false);
      setActiveAudioChapterIndex(null);
      activeAudioChapterRef.current = null;
      setMediaSessionState("none");
      if (message) setAudioError(message);
    };

    const onEnded = () => {
      if (manuallyStoppedRef.current) return;

      const currentIndex = activeAudioChapterRef.current ?? chapterIndexRef.current;
      const nextChapterIndex = currentIndex + 1;
      const nextChapter = book.chapters[nextChapterIndex];

      if (autoAdvancePodcastRef.current && nextChapter?.audio?.src) {
        playChapterAudio(nextChapterIndex);
        return;
      }

      finishAudioPlayback(
        nextChapter
          ? autoAdvancePodcastRef.current
            ? "下一章尚未有音檔，已停止連續播放"
            : "已播完本章"
          : undefined,
      );
    };

    const onError = () => {
      if (manuallyStoppedRef.current || activeAudioChapterRef.current === null) return;
      finishAudioPlayback("音檔載入失敗，請確認 books.json 的 audio.src 與 public 檔案一致");
    };

    audio.addEventListener("loadedmetadata", updateAudioProgress);
    audio.addEventListener("timeupdate", updateAudioProgress);
    audio.addEventListener("durationchange", updateAudioProgress);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("loadedmetadata", updateAudioProgress);
      audio.removeEventListener("timeupdate", updateAudioProgress);
      audio.removeEventListener("durationchange", updateAudioProgress);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [
    book.chapters,
    playChapterAudio,
    releaseNarrationWakeLock,
    setMediaSessionState,
  ]);

  useEffect(() => {
    persistProgress();
  }, [autoAdvancePodcast, chapterIndex, fontScale, persistProgress, podcastRate, speechRate]);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      setSpeechSupported("speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
    });
  }, []);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    const registerWorker = async () => {
      if ("serviceWorker" in navigator) {
        await navigator.serviceWorker.register("/sw.js");
      }
    };

    registerWorker().catch(() => undefined);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") goNext();
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") goPrevious();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrevious]);

  useEffect(() => {
    const captureAndSave = () => {
      captureReadingPosition();
      persistProgress();
    };

    const onScroll = () => {
      if (restoreTargetRef.current) return;
      captureReadingPosition();
      scheduleProgressSave();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        captureAndSave();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", captureAndSave);
    window.addEventListener("beforeunload", captureAndSave);
    document.addEventListener("visibilitychange", onVisibilityChange);

    const frame = window.requestAnimationFrame(captureReadingPosition);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", captureAndSave);
      window.removeEventListener("beforeunload", captureAndSave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (progressSaveTimerRef.current !== null) {
        window.clearTimeout(progressSaveTimerRef.current);
        progressSaveTimerRef.current = null;
      }
    };
  }, [captureReadingPosition, persistProgress, scheduleProgressSave]);

  useEffect(() => {
    const mediaSession = (navigator as NavigatorWithMediaSession).mediaSession;
    if (!mediaSession) return;

    const setActionHandler = (
      action: MediaSessionAction,
      handler: MediaSessionActionHandler | null,
    ) => {
      try {
        mediaSession.setActionHandler(action, handler);
      } catch {
        // Some mobile browsers expose Media Session but not every action.
      }
    };

    setActionHandler("play", () => {
      if (activeAudioChapterRef.current !== null) {
        audioElementRef.current?.play().then(() => {
          requestNarrationWakeLock();
          setIsNarrationPaused(false);
          setMediaSessionState("playing");
        }).catch(() => {
          setAudioError("Podcast 無法繼續播放");
        });
        return;
      }

      if (!isNarrating) {
        speakFromParagraph(activeParagraphRef.current ?? paragraphIndexRef.current);
        return;
      }

      if ("speechSynthesis" in window) {
        window.speechSynthesis.resume();
        setIsNarrationPaused(false);
        setMediaSessionState("playing");
      }
    });
    setActionHandler("pause", () => {
      if (activeAudioChapterRef.current !== null) {
        audioElementRef.current?.pause();
        setIsNarrationPaused(true);
        setMediaSessionState("paused");
        return;
      }

      if ("speechSynthesis" in window) {
        window.speechSynthesis.pause();
        setIsNarrationPaused(true);
        setMediaSessionState("paused");
      }
    });
    setActionHandler("stop", stopNarration);
    setActionHandler("previoustrack", () => goToNarrationStep(-1));
    setActionHandler("nexttrack", () => goToNarrationStep(1));

    return () => {
      setActionHandler("play", null);
      setActionHandler("pause", null);
      setActionHandler("stop", null);
      setActionHandler("previoustrack", null);
      setActionHandler("nexttrack", null);
    };
  }, [
    book.chapters,
    goToNarrationStep,
    isNarrating,
    playChapterAudio,
    requestNarrationWakeLock,
    setMediaSessionState,
    speakFromParagraph,
    stopNarration,
  ]);

  useEffect(() => {
    updateMediaSessionMetadata(chapterIndex);
    if (isNarrating) {
      setMediaSessionState(isNarrationPaused ? "paused" : "playing");
      return;
    }

    setMediaSessionState("none");
  }, [
    chapterIndex,
    isNarrating,
    isNarrationPaused,
    setMediaSessionState,
    updateMediaSessionMetadata,
  ]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && isNarrating && !isNarrationPaused) {
        requestNarrationWakeLock();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [isNarrating, isNarrationPaused, requestNarrationWakeLock]);

  useEffect(() => {
    return () => {
      releaseNarrationWakeLock();
      const audio = audioElementRef.current;
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
      }
      if ("speechSynthesis" in window) {
        manuallyStoppedRef.current = true;
        window.speechSynthesis.cancel();
      }
    };
  }, [releaseNarrationWakeLock]);

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  return (
    <main className="book-reader-shell">
      <aside className={`chapter-rail ${isMenuOpen ? "chapter-rail--open" : ""}`}>
        <div className="rail-heading">
          <BookOpen aria-hidden="true" size={18} />
          <span>Library / {book.title}</span>
        </div>
        <nav className="chapter-list" aria-label="章節">
          {book.chapters.map((item, index) => (
            <button
              className={`chapter-button ${index === chapterIndex ? "is-active" : ""}`}
              key={item.id}
              onClick={() => selectChapter(index)}
              type="button"
            >
              <span>{String(item.number).padStart(2, "0")}</span>
              <strong>{item.title}</strong>
            </button>
          ))}
        </nav>
      </aside>
      <button
        aria-label="關閉章節選單"
        className={`chapter-scrim ${isMenuOpen ? "chapter-scrim--open" : ""}`}
        onClick={() => setIsMenuOpen(false)}
        type="button"
      />

      <article className="reading-stage" style={{ "--reader-scale": fontScale } as CSSProperties}>
        <header className="book-header">
          <div>
            <span className="eyebrow">Book Reader</span>
            <h1>{book.title}</h1>
            <p>{book.author}</p>
          </div>
          <div className="header-actions">
            <Link aria-label="返回書庫" className="icon-button" href="/" title="書庫">
              <Home aria-hidden="true" size={20} />
            </Link>
            <button
              aria-label="開啟章節"
              className="icon-button"
              onClick={() => setIsMenuOpen((value) => !value)}
              title="章節"
              type="button"
            >
              <List aria-hidden="true" size={20} />
            </button>
            <button
              aria-label="儲存書籤"
              className="icon-button"
              onClick={saveBookmark}
              title="儲存書籤"
              type="button"
            >
              <BookmarkCheck aria-hidden="true" size={20} />
            </button>
            <button
              aria-label="安裝網頁App"
              className="icon-button install-button"
              disabled={!installPrompt}
              onClick={installApp}
              title="安裝"
              type="button"
            >
              <span aria-hidden="true" className="install-button-glow" />
              <Download aria-hidden="true" className="install-main-icon" size={20} />
              <Sparkles aria-hidden="true" className="install-spark-icon" size={12} />
            </button>
          </div>
        </header>
        {bookmarkNotice && (
          <p className="bookmark-status" role="status">
            {bookmarkNotice}
          </p>
        )}

        <section className="podcast-panel" aria-label="NotebookLM Podcast">
          <div className="podcast-primary">
            <Headphones aria-hidden="true" size={22} />
            <div>
              <span>NotebookLM Podcast</span>
              <strong>{podcastDetail}</strong>
            </div>
          </div>
          <div className="podcast-meta">
            <span>{stats.audioChapters}/{book.chapters.length} 章已匯入</span>
            <span>{hasChapterAudio ? "本章可播放" : "本章尚未下載"}</span>
            <span>{podcastRate}x</span>
            <span>{podcastAutoAdvanceLabel}</span>
          </div>
          <div aria-hidden="true" className="podcast-progress-track">
            <span style={{ width: `${podcastProgress}%` }} />
          </div>
          <div className="podcast-controls">
            <button
              aria-label="上一章 Podcast"
              disabled={!hasPreviousPodcast}
              onClick={() => goToAudioChapter(-1)}
              title="上一章 Podcast"
              type="button"
            >
              <SkipBack aria-hidden="true" size={18} />
            </button>
            <button
              aria-label={podcastPlayLabel}
              className="podcast-play-button"
              disabled={!hasChapterAudio}
              onClick={togglePodcast}
              title={podcastPlayLabel}
              type="button"
            >
              {isCurrentPodcastActive && isNarrating && !isNarrationPaused ? (
                <Pause aria-hidden="true" size={18} />
              ) : (
                <Play aria-hidden="true" size={18} />
              )}
            </button>
            <button
              aria-label="停止 Podcast"
              disabled={!isPodcastActive}
              onClick={stopNarration}
              title="停止 Podcast"
              type="button"
            >
              <Square aria-hidden="true" size={17} />
            </button>
            <button
              aria-label="下一章 Podcast"
              disabled={!hasNextPodcast}
              onClick={() => goToAudioChapter(1)}
              title="下一章 Podcast"
              type="button"
            >
              <SkipForward aria-hidden="true" size={18} />
            </button>
            <label className="rate-select podcast-rate-select">
              <span>速度</span>
              <select
                aria-label="Podcast 播放速度"
                disabled={!hasChapterAudio}
                onChange={(event) => changePodcastRate(Number(event.target.value))}
                value={podcastRate}
              >
                {podcastRates.map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}x
                  </option>
                ))}
              </select>
            </label>
            <label className="podcast-toggle">
              <input
                checked={autoAdvancePodcast}
                onChange={toggleAutoAdvancePodcast}
                type="checkbox"
              />
              <span>自動下一章</span>
            </label>
            {chapterAudio?.src && (
              <a className="podcast-download-link" download href={chapterAudio.src}>
                <Download aria-hidden="true" size={16} />
                下載音檔
              </a>
            )}
          </div>
          {audioError && <p className="podcast-status">{audioError}</p>}
        </section>

        <section className="chapter-intro" aria-labelledby="chapter-title">
          <span>CH {String(chapter.number).padStart(2, "0")}</span>
          <h2 id="chapter-title">{chapter.title}</h2>
          <p>{chapter.summary}</p>
          <div className="chapter-meta">
            <span>{chapter.minutes} min</span>
            <span>{chapter.paragraphs.length} paragraphs</span>
            {stats.audioChapters > 0 && (
              <span>NotebookLM Podcast {stats.audioChapters}/{book.chapters.length}</span>
            )}
            <span>{progress}% complete</span>
          </div>
        </section>

        <nav className="reader-control-bar" aria-label="閱讀控制">
          <button aria-label="上一章" onClick={goPrevious} title="上一章" type="button">
            <ChevronLeft aria-hidden="true" size={22} />
          </button>
          <button
            aria-label="縮小字級"
            onClick={() => setFontScale((value) => Math.max(0.92, value - 0.04))}
            title="縮小字級"
            type="button"
          >
            <Minus aria-hidden="true" size={20} />
          </button>
          <button
            aria-label="放大字級"
            onClick={() => setFontScale((value) => Math.min(1.18, value + 0.04))}
            title="放大字級"
            type="button"
          >
            <Plus aria-hidden="true" size={20} />
          </button>
          <button aria-label="下一章" onClick={goNext} title="下一章" type="button">
            <ChevronRight aria-hidden="true" size={22} />
          </button>
          <div className="player-readout">
            <span>{book.title}</span>
            <strong>{chapter.title}</strong>
          </div>
        </nav>

        <section className="narration-panel" aria-label="書本朗讀">
          <div className="narration-primary">
            <Volume2 aria-hidden="true" size={20} />
            <div>
              <span>{playbackModeLabel}</span>
              <strong>{playbackDetail}</strong>
            </div>
          </div>
          <div aria-hidden="true" className="narration-progress-track">
            <span style={{ width: `${narrationProgress}%` }} />
          </div>
          <div className="narration-controls">
            <button
              aria-label="上一段"
              className="narration-step-button"
              disabled={speechControlsDisabled}
              onClick={() => goToNarrationStep(-1)}
              title="上一段"
              type="button"
            >
              <SkipBack aria-hidden="true" size={18} />
            </button>
            <button
              aria-label={isSpeechNarrationActive && !isNarrationPaused ? `暫停${playbackModeLabel}` : `開始${playbackModeLabel}`}
              className="narration-play-button"
              disabled={speechControlsDisabled}
              onClick={toggleNarration}
              title={isSpeechNarrationActive && !isNarrationPaused ? "暫停" : "播放"}
              type="button"
            >
              {isSpeechNarrationActive && !isNarrationPaused ? (
                <Pause aria-hidden="true" size={18} />
              ) : (
                <Play aria-hidden="true" size={18} />
              )}
            </button>
            <button
              aria-label={`停止${playbackModeLabel}`}
              className="narration-stop-button"
              disabled={!isSpeechNarrationActive}
              onClick={stopNarration}
              onPointerDown={(event) => {
                event.preventDefault();
                stopNarration();
              }}
              title="停止"
              type="button"
            >
              <Square aria-hidden="true" size={17} />
            </button>
            <button
              aria-label="下一段"
              className="narration-step-button"
              disabled={speechControlsDisabled}
              onClick={() => goToNarrationStep(1)}
              title="下一段"
              type="button"
            >
              <SkipForward aria-hidden="true" size={18} />
            </button>
            <label className="rate-select">
              <span>速度</span>
              <select
                aria-label="朗讀速度"
                disabled={speechControlsDisabled}
                onChange={(event) => changeRate(Number(event.target.value))}
                value={speechRate}
              >
                {narrationRates.map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}x
                  </option>
                ))}
              </select>
            </label>
          </div>
          {(!speechSupported || speechError || isPodcastActive) && (
            <p className="narration-status">
              {isPodcastActive ? "Podcast 播放中；停止 Podcast 後可使用原本朗讀。" : speechError ?? "此瀏覽器不支援朗讀"}
            </p>
          )}
        </section>

        <section className="book-prose">
          {chapter.paragraphs.map((paragraph, index) => {
            const isSubhead = isSubheading(paragraph, index);
            const paragraphId = getParagraphId(chapter.id, index);
            const paragraphClassName =
              activeParagraphIndex === index ? "readable-block is-speaking" : "readable-block";
            return isSubhead ? (
              <h3
                className={paragraphClassName}
                data-paragraph-index={index}
                id={paragraphId}
                key={`${chapter.id}-${index}`}
              >
                {paragraph}
              </h3>
            ) : (
              <p
                className={paragraphClassName}
                data-paragraph-index={index}
                id={paragraphId}
                key={`${chapter.id}-${index}`}
              >
                {paragraph}
              </p>
            );
          })}
        </section>
      </article>

      <aside className="book-context-rail">
        <Image
          className="book-context-cover"
          src={book.cover}
          alt={`${book.title} 封面`}
          width={900}
          height={1350}
          priority
        />
        <div className="story-progress">
          <span>{chapterIndex + 1} / {book.chapters.length}</span>
          <div aria-hidden="true" className="progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="book-facts">
          <section>
            <h3>作者</h3>
            <p>{book.author}</p>
          </section>
          <section>
            <h3>總量</h3>
            <p>
              {stats.chapters} 章 / {stats.paragraphs} 段 / 約 {stats.minutes} 分鐘
              {stats.audioChapters > 0 ? ` / Podcast ${stats.audioChapters} 章` : ""}
            </p>
          </section>
          <section>
            <h3>分類</h3>
            <p>{book.genre.join(" / ")}</p>
          </section>
        </div>
      </aside>
    </main>
  );
}
