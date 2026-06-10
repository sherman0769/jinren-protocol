import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComicReader } from "@/components/comic-reader";
import { books, getBookBySlug } from "@/lib/comic";

type BookPageProps = {
  params: Promise<{ bookId: string }>;
};

export function generateStaticParams() {
  return books.map((book) => ({ bookId: book.slug }));
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { bookId } = await params;
  const book = getBookBySlug(bookId);

  if (!book) return {};

  return {
    title: `${book.title}｜漫畫閱讀器`,
    description: book.description,
    openGraph: {
      title: `${book.title}｜${book.subtitle}`,
      description: book.description,
      images: [
        {
          url: book.ogImage,
          width: 1200,
          height: 630,
          alt: `${book.title} 分享預覽圖`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${book.title}｜${book.subtitle}`,
      description: book.description,
      images: [book.ogImage],
    },
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const { bookId } = await params;
  const book = getBookBySlug(bookId);

  if (!book) notFound();

  return <ComicReader book={book} />;
}
