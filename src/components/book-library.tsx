import { BookOpen, Clock, Library, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getBookStats, type Book } from "@/lib/books";

type BookLibraryProps = {
  books: Book[];
};

export function BookLibrary({ books }: BookLibraryProps) {
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

  return (
    <main className="library-shell">
      <header className="library-header">
        <div>
          <span className="eyebrow">Digital Book Reader</span>
          <h1>書籍書庫</h1>
          <p>選擇一本書開始閱讀。內容由我們建立與整理，首頁只放書籍，進入後提供章節目錄、閱讀進度與舒適的長文閱讀介面。</p>
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
                <div className="tag-row">
                  {book.genre.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <Link className="read-link" href={`/books/${book.slug}`}>
                  <Play aria-hidden="true" size={17} />
                  開始閱讀
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
