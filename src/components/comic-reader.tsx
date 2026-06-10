"use client";

import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  Home,
  List,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Book } from "@/lib/comic";

type ComicReaderProps = {
  book: Book;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const progressKeyPrefix = "comic-reader-progress";

export function ComicReader({ book }: ComicReaderProps) {
  const { characters, episodes, referenceSheet } = book;
  const [episodeIndex, setEpisodeIndex] = useState(0);
  const [panelIndex, setPanelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const panelRefs = useRef<Array<HTMLElement | null>>([]);
  const progressKey = `${progressKeyPrefix}:${book.slug}`;

  const episode = episodes[episodeIndex];
  const panel = episode.panels[panelIndex];
  const totalPanels = episodes.reduce((total, item) => total + item.panels.length, 0);
  const readPanels =
    episodes
      .slice(0, episodeIndex)
      .reduce((total, item) => total + item.panels.length, 0) +
    panelIndex +
    1;
  const progress = Math.round((readPanels / totalPanels) * 100);

  const activeArc = useMemo(() => {
    if (episode.number <= 5) return "世界建立";
    if (episode.number <= 10) return "痛苦揭露";
    if (episode.number <= 15) return "文明危機";
    return "人性收束";
  }, [episode.number]);

  const selectEpisode = useCallback((nextEpisodeIndex: number) => {
    setEpisodeIndex(nextEpisodeIndex);
    setPanelIndex(0);
    setIsMenuOpen(false);
  }, []);

  const goNext = useCallback(() => {
    setPanelIndex((currentPanel) => {
      const currentEpisode = episodes[episodeIndex];
      const nextPanel = currentPanel + 1;

      if (currentEpisode.panels[nextPanel]) {
        return nextPanel;
      }

      const nextEpisode = episodeIndex + 1;
      if (episodes[nextEpisode]) {
        setEpisodeIndex(nextEpisode);
        return 0;
      }

      setIsPlaying(false);
      return currentPanel;
    });
  }, [episodeIndex, episodes]);

  const goPrevious = useCallback(() => {
    setPanelIndex((currentPanel) => {
      if (currentPanel > 0) return currentPanel - 1;

      const previousEpisode = episodeIndex - 1;
      if (episodes[previousEpisode]) {
        setEpisodeIndex(previousEpisode);
        return episodes[previousEpisode].panels.length - 1;
      }

      return currentPanel;
    });
  }, [episodeIndex, episodes]);

  useEffect(() => {
    const saved = window.localStorage.getItem(progressKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as { episodeIndex: number; panelIndex: number };
      if (
        Number.isInteger(parsed.episodeIndex) &&
        Number.isInteger(parsed.panelIndex) &&
        episodes[parsed.episodeIndex]?.panels[parsed.panelIndex]
      ) {
        window.requestAnimationFrame(() => {
          setEpisodeIndex(parsed.episodeIndex);
          setPanelIndex(parsed.panelIndex);
        });
      }
    } catch {
      window.localStorage.removeItem(progressKey);
    }
  }, [episodes, progressKey]);

  useEffect(() => {
    window.localStorage.setItem(
      progressKey,
      JSON.stringify({ episodeIndex, panelIndex }),
    );
  }, [episodeIndex, panelIndex, progressKey]);

  useEffect(() => {
    const registerWorker = async () => {
      if ("serviceWorker" in navigator) {
        await navigator.serviceWorker.register("/sw.js");
      }
    };

    registerWorker().catch(() => undefined);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const target = panelRefs.current[panelIndex];
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [episodeIndex, panelIndex]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setTimeout(() => {
      goNext();
    }, panel.autoplayMs);

    return () => window.clearTimeout(timer);
  }, [goNext, isPlaying, panel.autoplayMs]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") goNext();
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") goPrevious();
      if (event.key === " ") {
        event.preventDefault();
        setIsPlaying((value) => !value);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrevious]);

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  return (
    <main className="reader-shell">
      <aside className={`episode-rail ${isMenuOpen ? "episode-rail--open" : ""}`}>
        <div className="rail-heading">
          <BookOpen aria-hidden="true" size={18} />
            <span>Library / {book.title}</span>
        </div>
        <nav className="episode-list" aria-label="章節">
          {episodes.map((item, index) => (
            <button
              className={`episode-button ${index === episodeIndex ? "is-active" : ""}`}
              key={item.id}
              onClick={() => selectEpisode(index)}
              type="button"
            >
              <span>{String(item.number).padStart(2, "0")}</span>
              <strong>{item.title}</strong>
            </button>
          ))}
        </nav>
      </aside>

      <section className="reader-stage" aria-live="polite">
        <header className="series-header">
          <div>
            <span className="eyebrow">{activeArc}</span>
            <h1>{book.title}</h1>
            <p>{book.subtitle}</p>
          </div>
          <div className="header-actions">
            <Link aria-label="返回書庫" className="icon-button" href="/" title="書庫">
              <Home aria-hidden="true" size={20} />
            </Link>
            <button
              aria-label="開啟章節"
              className="icon-button"
              onClick={() => setIsMenuOpen((value) => !value)}
              title="章節"
              type="button"
            >
              <List aria-hidden="true" size={20} />
            </button>
            <button
              aria-label="安裝網頁App"
              className="icon-button"
              disabled={!installPrompt}
              onClick={installApp}
              title="安裝"
              type="button"
            >
              <Download aria-hidden="true" size={20} />
            </button>
          </div>
        </header>

        <section className="episode-intro" aria-labelledby="episode-title">
          <div>
            <span>EP {String(episode.number).padStart(2, "0")}</span>
            <h2 id="episode-title">{episode.title}</h2>
          </div>
          <p>{episode.summary}</p>
          <div className="episode-meta">
            <span>{episode.duration}</span>
            <span>{episode.panels.length} panels</span>
            <span>{progress}% complete</span>
          </div>
        </section>

        <div className="panel-stack">
          {episode.panels.map((item, index) => (
            <article
              className={`comic-panel ${index === panelIndex ? "is-current" : ""}`}
              key={item.id}
              ref={(node) => {
                panelRefs.current[index] = node;
              }}
            >
              <button
                aria-label={`跳到${item.caption}`}
                className="panel-image-button"
                onClick={() => setPanelIndex(index)}
                type="button"
              >
                <Image
                  src={item.image}
                  alt={item.alt}
                  width={1080}
                  height={1620}
                  priority={index < 2}
                />
              </button>
              <div className="panel-caption">
                <span>{item.caption}</span>
                <p>{item.beat}</p>
                {item.dialogue ? (
                  <blockquote>
                    <strong>{item.speaker}</strong>
                    {item.dialogue}
                  </blockquote>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="context-rail">
        <div className="story-progress">
          <Sparkles aria-hidden="true" size={18} />
          <span>{readPanels} / {totalPanels}</span>
          <div aria-hidden="true" className="progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
        <Image
          className="reference-sheet"
          src={referenceSheet}
          alt="近人協議角色設定參考圖"
          width={1200}
          height={1200}
        />
        <div className="character-list">
          {characters.map((character) => (
            <section key={character.id}>
              <h3>{character.name}</h3>
              <p>{character.role}</p>
            </section>
          ))}
        </div>
      </aside>

      <nav className="player-bar" aria-label="閱讀播放器">
        <button aria-label="上一格" onClick={goPrevious} title="上一格" type="button">
          <ChevronLeft aria-hidden="true" size={22} />
        </button>
        <button
          aria-label={isPlaying ? "暫停" : "播放"}
          className="play-button"
          onClick={() => setIsPlaying((value) => !value)}
          title={isPlaying ? "暫停" : "播放"}
          type="button"
        >
          {isPlaying ? <Pause aria-hidden="true" size={22} /> : <Play aria-hidden="true" size={22} />}
        </button>
        <button aria-label="下一格" onClick={goNext} title="下一格" type="button">
          <ChevronRight aria-hidden="true" size={22} />
        </button>
        <button
          aria-label="回到本集開頭"
          onClick={() => setPanelIndex(0)}
          title="回到本集開頭"
          type="button"
        >
          <RotateCcw aria-hidden="true" size={20} />
        </button>
        <div className="player-readout">
          <span>{episode.title}</span>
          <strong>{panel.caption}</strong>
        </div>
      </nav>
    </main>
  );
}
