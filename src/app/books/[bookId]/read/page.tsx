import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookReader } from "@/components/book-reader";
import { books, getBookBySlug } from "@/lib/books";

type BookReadPageProps = {
  params: Promise<{ bookId: string }>;
};

export function generateStaticParams() {
  return books.map((book) => ({ bookId: book.slug }));
}

export async function generateMetadata({ params }: BookReadPageProps): Promise<Metadata> {
  const { bookId } = await params;
  const book = getBookBySlug(bookId);

  if (!book) return {};

  return {
    title: `${book.title}｜電子書`,
    description: book.description,
    openGraph: {
      title: `${book.title}｜電子書閱讀`,
      description: book.description,
      images: [{ url: book.ogImage, alt: `${book.title} 封面` }],
    },
  };
}

export default async function BookReadPage({ params }: BookReadPageProps) {
  const { bookId } = await params;
  const book = getBookBySlug(bookId);

  if (!book) notFound();

  return <BookReader book={book} showPodcast={false} />;
}
