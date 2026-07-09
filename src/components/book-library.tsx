"use client";

import { BookOpen, Clock, Headphones, Library, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getBookStats, type Book } from "@/lib/books";

type BookLibraryProps = {
  books: Book[];
};

type SavedProgress = {
  chapterIndex?: number;
  paragraphIndex?: number;
  updatedAt?: number;
};

const progressKeyPrefix = "book-reader-progress";

type BookLibraryItem = {
  book: Book;
  stats: ReturnType<typeof getBookStats>;
  progress?: SavedProgress;
  savedChapterIndex: number | null;
  savedChapter: Book["chapters"][number] | null;
  savedParagraph: number | null;
  hasBookmark: boolean;
};

type ShelfSection = {
  id: string;
  title: string;
  description: string;
  books: BookLibraryItem[];
};

const curatedShelfDefinitions = [
  {
    id: "agent-workflows",
    title: "Agent 與工作流",
    description: "AI Agent、Loop Engineering、工作流設計與人機協作。",
    keywords: ["AI Agent", "Agent", "Agentic", "工作流", "Loop", "多智慧體"],
  },
  {
    id: "engineering-systems",
    title: "工程與驗證",
    description: "工程操作、部署流程、Runtime、架構與驗證治理。",
    keywords: ["AI 工程", "Codex", "GitHub", "部署", "Runtime", "架構", "技術方法論", "驗證"],
  },
  {
    id: "thinking-systems",
    title: "認知與哲學",
    description: "AI 哲學、認知能力、第一性原理與未來教育。",
    keywords: ["哲學", "認知", "語義", "第一性", "素養", "未來", "教育"],
  },
  {
    id: "creative-tools",
    title: "創作與設計",
    description: "視覺生成、品牌工作流與創作工具方法。",
    keywords: ["Image2", "視覺", "品牌", "AI 設計", "生成"],
  },
  {
    id: "growth-society",
    title: "成長與社會",
    description: "個人成長、自由工作、AI 社會觀察與數位平權。",
    keywords: ["個人成長", "自由", "社會", "平權", "多面人生"],
  },
] satisfies Array<{
  id: string;
  title: string;
  description: string;
  keywords: string[];
}>;

function matchesShelf(book: Book, keywords: string[]) {
  const haystack = `${book.title} ${book.subtitle} ${book.description} ${book.genre.join(" ")}`;
  return keywords.some((keyword) => haystack.includes(keyword));
}

function BookShelfCard({
  detail,
  priority,
}: {
  detail: BookLibraryItem;
  priority: boolean;
}) {
  const { book, hasBookmark, savedChapter, savedParagraph, stats } = detail;

  return (
    <article className={`book-spine-card ${hasBookmark ? "book-spine-card--continue" : ""}`}>
      <Link
        className="book-spine-cover"
        href={`/books/${book.slug}`}
        aria-label={`閱讀${book.title}`}
      >
        <Image
          src={book.cover}
          alt={`${book.title} 封面`}
          width={600}
          height={900}
          sizes="(max-width: 720px) 58vw, (max-width: 1180px) 190px, 210px"
          priority={priority}
        />
      </Link>
      <div className="book-spine-body">
        <div className="book-spine-meta" aria-label={`${book.title} 統計`}>
          <span>
            <BookOpen aria-hidden="true" size={13} />
            {stats.chapters}
          </span>
          <span>
            <Clock aria-hidden="true" size={13} />
            {stats.minutes}
          </span>
          {stats.audioChapters > 0 && (
            <span>
              <Headphones aria-hidden="true" size={13} />
              {stats.audioChapters}
            </span>
          )}
        </div>
        <h3>{book.title}</h3>
        <p>{book.author}</p>
        {savedChapter && (
          <p className="book-spine-bookmark">
            第 {savedChapter.number} 章
            {savedParagraph ? `，第 ${savedParagraph} 段` : ""}｜{savedChapter.title}
          </p>
        )}
        <div className="book-spine-tags">
          {book.genre.slice(0, 2).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <Link
          className={`read-link ${hasBookmark ? "read-link--continue" : ""}`}
          href={`/books/${book.slug}`}
        >
          <Play aria-hidden="true" size={16} />
          {hasBookmark ? "繼續" : "閱讀"}
        </Link>
      </div>
    </article>
  );
}

export function BookLibrary({ books }: BookLibraryProps) {
  const [savedProgress, setSavedProgress] = useState<Record<string, SavedProgress>>({});

  const bookDetails = useMemo<BookLibraryItem[]>(
    () =>
      books.map((book) => {
        const stats = getBookStats(book);
        const progress = savedProgress[book.slug];
        const savedChapterIndex =
          typeof progress?.chapterIndex === "number" && book.chapters[progress.chapterIndex]
            ? progress.chapterIndex
            : null;
        const savedChapter = savedChapterIndex !== null ? book.chapters[savedChapterIndex] : null;
        const savedParagraph =
          savedChapter &&
          typeof progress?.paragraphIndex === "number" &&
          savedChapter.paragraphs[progress.paragraphIndex]
            ? progress.paragraphIndex + 1
            : null;

        return {
          book,
          stats,
          progress,
          savedChapterIndex,
          savedChapter,
          savedParagraph,
          hasBookmark: savedChapterIndex !== null,
        };
      }),
    [books, savedProgress],
  );

  const libraryStats = useMemo(
    () =>
      bookDetails.reduce(
        (total, detail) => ({
          chapters: total.chapters + detail.stats.chapters,
          minutes: total.minutes + detail.stats.minutes,
          audioChapters: total.audioChapters + detail.stats.audioChapters,
        }),
        { chapters: 0, minutes: 0, audioChapters: 0 },
      ),
    [bookDetails],
  );

  const continueBooks = useMemo(
    () =>
      bookDetails
        .filter((detail) => detail.hasBookmark)
        .sort((first, second) => (second.progress?.updatedAt ?? 0) - (first.progress?.updatedAt ?? 0)),
    [bookDetails],
  );

  const podcastBooks = useMemo(
    () => bookDetails.filter((detail) => detail.stats.audioChapters > 0),
    [bookDetails],
  );

  const shelfSections = useMemo<ShelfSection[]>(() => {
    const curatedShelves = curatedShelfDefinitions
      .map<ShelfSection>((definition) => ({
        id: definition.id,
        title: definition.title,
        description: definition.description,
        books: bookDetails.filter((detail) => matchesShelf(detail.book, definition.keywords)),
      }))
      .filter((section) => section.books.length > 0);

    return [
      ...(continueBooks.length > 0
        ? [
            {
              id: "continue",
              title: "繼續閱讀",
              description: "依照你的上次閱讀位置排列，直接回到章節與段落。",
              books: continueBooks,
            },
          ]
        : []),
      ...(podcastBooks.length > 0
        ? [
            {
              id: "podcast",
              title: "Podcast 書架",
              description: "已匯入 NotebookLM 逐章音頻的作品，適合直接收聽。",
              books: podcastBooks,
            },
          ]
        : []),
      ...curatedShelves,
      {
        id: "all",
        title: "全部藏書",
        description: "完整書庫索引，保留每一本書的入口。",
        books: bookDetails,
      },
    ];
  }, [bookDetails, continueBooks, podcastBooks]);

  const focusBook = continueBooks[0] ?? podcastBooks[0] ?? bookDetails[0];

  const shelfNavItems = shelfSections.map((section) => ({
    id: section.id,
    title: section.title,
    count: section.books.length,
  }));

  const latestBooks = bookDetails.slice(-4).reverse();

  const podcastCoverage =
    libraryStats.chapters > 0
      ? Math.round((libraryStats.audioChapters / libraryStats.chapters) * 100)
      : 0;

  const totalHours = Math.max(1, Math.round(libraryStats.minutes / 60));

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
    <main className="library-shell library-shell--shelves">
      <header className="library-header">
        <div>
          <span className="eyebrow">Shishu Academy</span>
          <h1>詩塾書院</h1>
          <p>整理 AI 時代的知識理解方法：把書、課程、工作流與長任務思考放在同一座書院中，方便持續閱讀、對照與沉澱。</p>
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
            <Headphones aria-hidden="true" size={16} />
            {libraryStats.audioChapters} podcasts
          </span>
          <span>
            <Clock aria-hidden="true" size={16} />
            {totalHours} hours
          </span>
        </div>
      </header>

      <div className="library-dashboard">
        <nav className="shelf-nav" aria-label="書架導覽">
          <span>書架</span>
          {shelfNavItems.map((item) => (
            <a href={`#shelf-${item.id}`} key={item.id}>
              <strong>{item.title}</strong>
              <small>{item.count}</small>
            </a>
          ))}
        </nav>

        <div className="shelf-stack">
          {shelfSections.map((section, sectionIndex) => (
            <section
              className={`book-shelf book-shelf--${section.id}`}
              id={`shelf-${section.id}`}
              key={section.id}
              aria-labelledby={`shelf-title-${section.id}`}
            >
              <div className="shelf-heading">
                <div>
                  <span>{String(section.books.length).padStart(2, "0")} books</span>
                  <h2 id={`shelf-title-${section.id}`}>{section.title}</h2>
                </div>
                <p>{section.description}</p>
              </div>
              <div className="shelf-books">
                {section.books.map((detail, index) => (
                  <BookShelfCard
                    detail={detail}
                    key={`${section.id}-${detail.book.id}`}
                    priority={sectionIndex === 0 && index < 3}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {focusBook && (
          <aside className="library-focus" aria-label="焦點書籍">
            <span className="focus-label">
              {focusBook.hasBookmark ? "Continue" : focusBook.stats.audioChapters > 0 ? "Podcast" : "Featured"}
            </span>
            <Link
              className="focus-cover-link"
              href={`/books/${focusBook.book.slug}`}
              aria-label={`閱讀${focusBook.book.title}`}
            >
              <Image
                src={focusBook.book.cover}
                alt={`${focusBook.book.title} 封面`}
                width={600}
                height={900}
                sizes="(max-width: 980px) 160px, 260px"
                priority
              />
            </Link>
            <div className="focus-copy">
              <h2>{focusBook.book.title}</h2>
              <p>{focusBook.book.description}</p>
              {focusBook.savedChapter && (
                <p className="focus-bookmark">
                  書籤：第 {focusBook.savedChapter.number} 章
                  {focusBook.savedParagraph ? `，第 ${focusBook.savedParagraph} 段` : ""}｜{focusBook.savedChapter.title}
                </p>
              )}
              <div className="focus-stat-grid">
                <span>{focusBook.stats.chapters} 章</span>
                <span>{focusBook.stats.minutes} 分鐘</span>
                <span>Podcast {focusBook.stats.audioChapters} 章</span>
                <span>覆蓋 {podcastCoverage}%</span>
              </div>
              <Link
                className={`read-link ${focusBook.hasBookmark ? "read-link--continue" : ""}`}
                href={`/books/${focusBook.book.slug}`}
              >
                <Play aria-hidden="true" size={17} />
                {focusBook.hasBookmark ? "繼續閱讀" : "打開作品"}
              </Link>
            </div>
            {latestBooks.length > 0 && (
              <div className="latest-stack">
                <span>新近入庫</span>
                {latestBooks.map((detail) => (
                  <Link href={`/books/${detail.book.slug}`} key={detail.book.id}>
                    <strong>{detail.book.title}</strong>
                    <small>{detail.stats.chapters} 章</small>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        )}
      </div>
    </main>
  );
}
