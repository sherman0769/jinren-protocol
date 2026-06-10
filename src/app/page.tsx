import { BookLibrary } from "@/components/book-library";
import { books } from "@/lib/comic";

export default function Home() {
  return <BookLibrary books={books} />;
}
