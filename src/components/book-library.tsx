import { BookOpen, Layers, Play, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Book } from "@/lib/comic";

type BookLibraryProps = {
  books: Book[];
};

export function BookLibrary({ books }: BookLibraryProps) {
  const totalEpisodes = books.reduce((total, book) => total + book.episodes.length, 0);
  const totalPanels = books.reduce(
    (total, book) =>
      total +
      book.episodes.reduce((episodeTotal, episode) => episodeTotal + episode.panels.length, 0),
    0,
  );

  return (
    <main className="library-shell">
      <header className="library-header">
        <div>
          <span className="eyebrow">Original Comic Reader</span>
          <h1>漫畫書庫</h1>
          <p>選擇一本作品開始閱讀。書籍內容由我們在專案資料中建立，之後可以持續新增漫畫、章節與正式圖像。</p>
        </div>
        <div className="library-stats" aria-label="書庫統計">
          <span>
            <BookOpen aria-hidden="true" size={16} />
            {books.length} books
          </span>
          <span>
            <Layers aria-hidden="true" size={16} />
            {totalEpisodes} episodes
          </span>
          <span>{totalPanels} panels</span>
        </div>
      </header>

      <section className="book-grid" aria-label="作品列表">
        {books.map((book) => (
          <article className="book-card" key={book.id}>
            <Link className="book-cover-link" href={`/books/${book.slug}`} aria-label={`閱讀${book.title}`}>
              <Image
                src={book.cover}
                alt={`${book.title} 封面`}
                width={900}
                height={1350}
                priority
              />
            </Link>
            <div className="book-card-body">
              <div className="book-status-row">
                <span className="book-status">{book.status === "published" ? "已發布" : "創作中"}</span>
                <span>{book.rating}</span>
              </div>
              <h2>{book.title}</h2>
              <p>{book.subtitle}</p>
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
        ))}

        <article className="book-card book-card--new">
          <div className="new-book-mark">
            <Plus aria-hidden="true" size={26} />
          </div>
          <div className="book-card-body">
            <span className="book-status">下一本</span>
            <h2>新增作品槽</h2>
            <p>新的漫畫會從資料層加入，首頁自動出現，並使用同一套閱讀器。</p>
            <p className="book-description">
              可建立新書封面、章節資料、正式漫畫圖、角色表與分享圖，不需要改閱讀器核心。
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}
