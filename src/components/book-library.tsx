"use client";

import { BookOpen, Clock, Library, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBookStats, type Book } from "@/lib/books";

type BookLibraryProps = {
  books: Book[];
};

type SavedProgress = {
  chapterIndex?: number;
  updatedAt?: number;
};

const progressKeyPrefix = "book-reader-progress";

export function BookLibrary({ books }: BookLibraryProps) {
  const [savedProgress, setSavedProgress] = useState<Record<string, SavedProgress>>({});
  const libraryStats = books.reduce(
    (total, book) => {
      const stats = getBookStats(book);
      return {
        chapters: total.chapters + stats.chapters,
        minutes: total.minutes + stats.minutes,
      };
    },
    { chapters: 0, minutes: 0 },
  );

  useEffect(() => {
    const progress = books.reduce<Record<string, SavedProgress>>((current, book) => {
      const saved = window.localStorage.getItem(`${progressKeyPrefix}:${book.slug}`);
      if (!saved) return current;

      try {
        const parsed = JSON.parse(saved) as SavedProgress;
        if (Number.isInteger(parsed.chapterIndex)) {
          current[book.slug] = parsed;
        }
      } catch {
        window.localStorage.removeItem(`${progressKeyPrefix}:${book.slug}`);
      }

      return current;
    }, {});

    const frame = window.requestAnimationFrame(() => setSavedProgress(progress));

    return () => window.cancelAnimationFrame(frame);
  }, [books]);

  return (
    <main className="library-shell">
      <header className="library-header">
        <div>
          <span className="eyebrow">Digital Book Reader</span>
          <h1>Li`s Meet 私人書庫</h1>
          <p>整理 AI 時代的知識理解方法：把書、課程、工作流與長任務思考放在同一座私人書架中，方便持續閱讀、對照與沉澱。</p>
        </div>
        <div className="library-stats" aria-label="書庫統計">
          <span>
            <Library aria-hidden="true" size={16} />
            {books.length} books
          </span>
          <span>
            <BookOpen aria-hidden="true" size={16} />
            {libraryStats.chapters} chapters
          </span>
          <span>
            <Clock aria-hidden="true" size={16} />
            {libraryStats.minutes} min
          </span>
        </div>
      </header>

      <section className="book-grid" aria-label="作品列表">
        {books.map((book) => {
          const stats = getBookStats(book);
          const progress = savedProgress[book.slug];
          const savedChapterIndex =
            typeof progress?.chapterIndex === "number" &&
            book.chapters[progress.chapterIndex]
              ? progress.chapterIndex
              : null;
          const hasBookmark = savedChapterIndex !== null;
          const savedChapter = hasBookmark ? book.chapters[savedChapterIndex] : null;

          return (
            <article className="book-card" key={book.id}>
              <Link
                className="book-cover-link"
                href={`/books/${book.slug}`}
                aria-label={`閱讀${book.title}`}
              >
                <Image
                  src={book.cover}
                  alt={`${book.title} 封面`}
                  width={900}
                  height={1350}
                  sizes="(max-width: 720px) 82vw, (max-width: 1180px) 34vw, 300px"
                  priority
                />
              </Link>
              <div className="book-card-body">
                <div className="book-status-row">
                  <span className="book-status">
                    {book.status === "published" ? "已發布" : "整理中"}
                  </span>
                  <span>{book.rating}</span>
                </div>
                <div className="book-card-meta" aria-label={`${book.title} 統計`}>
                  <span>
                    <BookOpen aria-hidden="true" size={14} />
                    {stats.chapters} 章
                  </span>
                  <span>
                    <Clock aria-hidden="true" size={14} />
                    {stats.minutes} 分鐘
                  </span>
                </div>
                <h2>{book.title}</h2>
                <p>{book.author}</p>
                <p className="book-description">{book.description}</p>
                {savedChapter && (
                  <p className="continue-note">
                    書籤：第 {savedChapter.number} 章｜{savedChapter.title}
                  </p>
                )}
                <div className="tag-row">
                  {book.genre.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <Link
                  className={`read-link ${hasBookmark ? "read-link--continue" : ""}`}
                  href={`/books/${book.slug}`}
                >
                  <Play aria-hidden="true" size={17} />
                  {hasBookmark ? "繼續閱讀" : "開始閱讀"}
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
