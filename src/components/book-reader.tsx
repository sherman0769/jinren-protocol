"use client";

import {
  BookmarkCheck,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
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

const progressKeyPrefix = "book-reader-progress";
const narrationRates = [0.75, 1, 1.25, 1.5, 2];

export function BookReader({ book }: BookReaderProps) {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [fontScale, setFontScale] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isNarrationPaused, setIsNarrationPaused] = useState(false);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [bookmarkNotice, setBookmarkNotice] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const paragraphIndexRef = useRef(0);
  const manuallyStoppedRef = useRef(false);
  const activeParagraphRef = useRef<number | null>(null);
  const speechRunRef = useRef(0);

  const chapter = book.chapters[chapterIndex];
  const stats = useMemo(() => getBookStats(book), [book]);
  const progressKey = `${progressKeyPrefix}:${book.slug}`;
  const progress = Math.round(((chapterIndex + 1) / book.chapters.length) * 100);
  const narrationProgress =
    activeParagraphIndex === null
      ? 0
      : Math.round(((activeParagraphIndex + 1) / chapter.paragraphs.length) * 100);

  const scrollToParagraph = useCallback((index: number) => {
    window.requestAnimationFrame(() => {
      document
        .getElementById(`chapter-${chapter.id}-paragraph-${index}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [chapter.id]);

  const stopNarration = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    manuallyStoppedRef.current = true;
    speechRunRef.current += 1;
    window.speechSynthesis.resume();
    window.speechSynthesis.cancel();
    window.setTimeout(() => window.speechSynthesis.cancel(), 0);
    window.setTimeout(() => window.speechSynthesis.cancel(), 120);
    setIsNarrating(false);
    setIsNarrationPaused(false);
    setActiveParagraphIndex(null);
    activeParagraphRef.current = null;
  }, []);

  const speakFromParagraph = useCallback((startIndex: number, nextRate = speechRate) => {
    if (!("speechSynthesis" in window)) {
      setSpeechError("此瀏覽器不支援朗讀");
      return;
    }

    const paragraphs = book.chapters[chapterIndex]?.paragraphs ?? [];
    if (paragraphs.length === 0) return;

    const clampedIndex = Math.min(Math.max(startIndex, 0), paragraphs.length - 1);
    manuallyStoppedRef.current = false;
    const speechRun = speechRunRef.current + 1;
    speechRunRef.current = speechRun;
    window.speechSynthesis.resume();
    window.speechSynthesis.cancel();
    setSpeechError(null);
    setIsNarrating(true);
    setIsNarrationPaused(false);

    const speakAt = (index: number) => {
      if (index >= paragraphs.length) {
        setIsNarrating(false);
        setIsNarrationPaused(false);
        setActiveParagraphIndex(null);
        activeParagraphRef.current = null;
        return;
      }

      paragraphIndexRef.current = index;
      activeParagraphRef.current = index;
      setActiveParagraphIndex(index);
      scrollToParagraph(index);

      const utterance = new SpeechSynthesisUtterance(paragraphs[index]);
      utterance.lang = "zh-TW";
      utterance.rate = nextRate;
      utterance.pitch = 1;

      const voice = window.speechSynthesis
        .getVoices()
        .find((item) => item.lang.toLowerCase().startsWith("zh"));
      if (voice) utterance.voice = voice;

      utterance.onend = () => {
        if (!manuallyStoppedRef.current && speechRunRef.current === speechRun) {
          speakAt(index + 1);
        }
      };

      utterance.onerror = () => {
        if (manuallyStoppedRef.current || speechRunRef.current !== speechRun) return;
        setSpeechError("朗讀中斷，請再試一次");
        setIsNarrating(false);
        setIsNarrationPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakAt(clampedIndex);
  }, [book.chapters, chapterIndex, scrollToParagraph, speechRate]);

  const selectChapter = useCallback((nextIndex: number) => {
    stopNarration();
    setChapterIndex(nextIndex);
    setIsMenuOpen(false);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }, [stopNarration]);

  const goNext = useCallback(() => {
    stopNarration();
    setChapterIndex((current) => Math.min(current + 1, book.chapters.length - 1));
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }, [book.chapters.length, stopNarration]);

  const goPrevious = useCallback(() => {
    stopNarration();
    setChapterIndex((current) => Math.max(current - 1, 0));
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }, [stopNarration]);

  function toggleNarration() {
    if (!isNarrating) {
      speakFromParagraph(activeParagraphRef.current ?? 0);
      return;
    }

    if (!("speechSynthesis" in window)) return;

    if (isNarrationPaused) {
      window.speechSynthesis.resume();
      setIsNarrationPaused(false);
      return;
    }

    window.speechSynthesis.pause();
    setIsNarrationPaused(true);
  }

  function changeRate(nextRate: number) {
    setSpeechRate(nextRate);
    if (isNarrating) {
      window.requestAnimationFrame(() => {
        speakFromParagraph(paragraphIndexRef.current, nextRate);
      });
    }
  }

  function goToNarrationParagraph(offset: number) {
    const nextIndex = Math.min(
      Math.max((activeParagraphRef.current ?? paragraphIndexRef.current) + offset, 0),
      chapter.paragraphs.length - 1,
    );

    if (isNarrating) {
      speakFromParagraph(nextIndex);
      return;
    }

    paragraphIndexRef.current = nextIndex;
    activeParagraphRef.current = nextIndex;
    setActiveParagraphIndex(nextIndex);
    scrollToParagraph(nextIndex);
  }

  function saveBookmark() {
    window.localStorage.setItem(
      progressKey,
      JSON.stringify({ chapterIndex, fontScale, speechRate, updatedAt: Date.now() }),
    );
    setBookmarkNotice(`已保存：第 ${chapter.number} 章`);
    window.setTimeout(() => setBookmarkNotice(null), 2200);
  }

  useEffect(() => {
    const saved = window.localStorage.getItem(progressKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as {
        chapterIndex: number;
        fontScale?: number;
        speechRate?: number;
      };
      if (
        Number.isInteger(parsed.chapterIndex) &&
        book.chapters[parsed.chapterIndex]
      ) {
        window.requestAnimationFrame(() => setChapterIndex(parsed.chapterIndex));
      }
      if (typeof parsed.fontScale === "number") {
        window.requestAnimationFrame(() => {
          setFontScale(Math.min(1.18, Math.max(0.92, parsed.fontScale ?? 1)));
        });
      }
      if (typeof parsed.speechRate === "number") {
        const savedSpeechRate = parsed.speechRate;
        window.requestAnimationFrame(() => {
          setSpeechRate(narrationRates.includes(savedSpeechRate) ? savedSpeechRate : 1);
        });
      }
    } catch {
      window.localStorage.removeItem(progressKey);
    }
  }, [book.chapters, progressKey]);

  useEffect(() => {
    window.localStorage.setItem(
      progressKey,
      JSON.stringify({ chapterIndex, fontScale, speechRate, updatedAt: Date.now() }),
    );
  }, [chapterIndex, fontScale, progressKey, speechRate]);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      setSpeechSupported("speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
    });
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
    return () => {
      if ("speechSynthesis" in window) {
        manuallyStoppedRef.current = true;
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

        <section className="chapter-intro" aria-labelledby="chapter-title">
          <span>CH {String(chapter.number).padStart(2, "0")}</span>
          <h2 id="chapter-title">{chapter.title}</h2>
          <p>{chapter.summary}</p>
          <div className="chapter-meta">
            <span>{chapter.minutes} min</span>
            <span>{chapter.paragraphs.length} paragraphs</span>
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
              <span>朗讀</span>
              <strong>
                {activeParagraphIndex === null
                  ? "尚未開始"
                  : `第 ${activeParagraphIndex + 1} / ${chapter.paragraphs.length} 段`}
              </strong>
            </div>
          </div>
          <div aria-hidden="true" className="narration-progress-track">
            <span style={{ width: `${narrationProgress}%` }} />
          </div>
          <div className="narration-controls">
            <button
              aria-label="上一段"
              className="narration-step-button"
              disabled={!speechSupported}
              onClick={() => goToNarrationParagraph(-1)}
              title="上一段"
              type="button"
            >
              <SkipBack aria-hidden="true" size={18} />
            </button>
            <button
              aria-label={isNarrating && !isNarrationPaused ? "暫停朗讀" : "開始朗讀"}
              className="narration-play-button"
              disabled={!speechSupported}
              onClick={toggleNarration}
              title={isNarrating && !isNarrationPaused ? "暫停" : "播放"}
              type="button"
            >
              {isNarrating && !isNarrationPaused ? (
                <Pause aria-hidden="true" size={18} />
              ) : (
                <Play aria-hidden="true" size={18} />
              )}
            </button>
            <button
              aria-label="停止朗讀"
              className="narration-stop-button"
              disabled={!speechSupported}
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
              disabled={!speechSupported}
              onClick={() => goToNarrationParagraph(1)}
              title="下一段"
              type="button"
            >
              <SkipForward aria-hidden="true" size={18} />
            </button>
            <label className="rate-select">
              <span>速度</span>
              <select
                aria-label="朗讀速度"
                disabled={!speechSupported}
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
          {(!speechSupported || speechError) && (
            <p className="narration-status">
              {speechError ?? "此瀏覽器不支援朗讀"}
            </p>
          )}
        </section>

        <section className="book-prose">
          {chapter.paragraphs.map((paragraph, index) => {
            const isSubhead = paragraph.length <= 34 && index > 0;
            const paragraphId = `chapter-${chapter.id}-paragraph-${index}`;
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
            <p>{stats.chapters} 章 / {stats.paragraphs} 段 / 約 {stats.minutes} 分鐘</p>
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
