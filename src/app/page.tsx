import { ComicReader } from "@/components/comic-reader";
import { characters, episodes, season } from "@/lib/comic";

export default function Home() {
  return (
    <ComicReader
      episodes={episodes}
      characters={characters}
      referenceSheet={season.referenceSheet}
    />
  );
}
