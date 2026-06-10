"use client";

import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  Home,
  List,
  Minus,
  Plus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getBookStats, type Book } from "@/lib/books";

type BookReaderProps = {
  book: Book;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const progressKeyPrefix = "book-reader-progress";

export function BookReader({ book }: BookReaderProps) {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [fontScale, setFontScale] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const chapter = book.chapters[chapterIndex];
  const stats = useMemo(() => getBookStats(book), [book]);
  const progressKey = `${progressKeyPrefix}:${book.slug}`;
  const progress = Math.round(((chapterIndex + 1) / book.chapters.length) * 100);

  const selectChapter = useCallback((nextIndex: number) => {
    setChapterIndex(nextIndex);
    setIsMenuOpen(false);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }, []);

  const goNext = useCallback(() => {
    setChapterIndex((current) => Math.min(current + 1, book.chapters.length - 1));
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }, [book.chapters.length]);

  const goPrevious = useCallback(() => {
    setChapterIndex((current) => Math.max(current - 1, 0));
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(progressKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as { chapterIndex: number; fontScale?: number };
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
    } catch {
      window.localStorage.removeItem(progressKey);
    }
  }, [book.chapters, progressKey]);

  useEffect(() => {
    window.localStorage.setItem(
      progressKey,
      JSON.stringify({ chapterIndex, fontScale }),
    );
  }, [chapterIndex, fontScale, progressKey]);

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
              aria-label="安裝網頁App"
              className="icon-button"
              disabled={!installPrompt}
              onClick={installApp}
              title="安裝"
              type="button"
            >
              <Download aria-hidden="true" size={20} />
            </button>
          </div>
        </header>

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

        <section className="book-prose">
          {chapter.paragraphs.map((paragraph, index) => {
            const isSubhead = paragraph.length <= 34 && index > 0;
            return isSubhead ? (
              <h3 key={`${chapter.id}-${index}`}>{paragraph}</h3>
            ) : (
              <p key={`${chapter.id}-${index}`}>{paragraph}</p>
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
    </main>
  );
}
