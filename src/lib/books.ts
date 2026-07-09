import data from "@/content/books.json";

export type Chapter = {
  id: string;
  number: number;
  title: string;
  summary: string;
  minutes: number;
  audio?: {
    src: string;
    title?: string;
    provider?: "notebooklm" | "manual" | "tts";
    durationSeconds?: number;
  };
  paragraphs: string[];
};

export type Book = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  description: string;
  status: "draft" | "creating" | "published";
  genre: string[];
  rating: string;
  cover: string;
  ogImage: string;
  sourceUrl: string;
  chapters: Chapter[];
};

export const books = data.books as Book[];

export function getBookBySlug(slug: string) {
  return books.find((book) => book.slug === slug);
}

export function getBookStats(book: Book) {
  const paragraphs = book.chapters.reduce(
    (total, chapter) => total + chapter.paragraphs.length,
    0,
  );
  const characters = book.chapters.reduce(
    (total, chapter) =>
      total +
      chapter.paragraphs.reduce((chapterTotal, paragraph) => chapterTotal + paragraph.length, 0),
    0,
  );
  const minutes = book.chapters.reduce((total, chapter) => total + chapter.minutes, 0);
  const audioChapters = book.chapters.reduce(
    (total, chapter) => total + (chapter.audio?.src ? 1 : 0),
    0,
  );

  return {
    chapters: book.chapters.length,
    paragraphs,
    characters,
    minutes,
    audioChapters,
  };
}
