import { BookLibrary } from "@/components/book-library";
import { books } from "@/lib/books";

export default function Home() {
  return <BookLibrary books={books} />;
}
