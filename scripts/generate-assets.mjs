import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const publicDir = path.join(root, "public");
const comicDir = path.join(publicDir, "comic", "season-01");
const iconsDir = path.join(publicDir, "icons");
const assetDir = path.join(publicDir, "comic", "assets");

const palette = [
  ["#071018", "#42d3ff", "#ff4fd8", "#f5f1e7"],
  ["#12100f", "#f2b84b", "#56f0c9", "#f4ede2"],
  ["#16121d", "#b08cff", "#34e4ff", "#fff4d8"],
  ["#071715", "#42ffb0", "#ff6464", "#eafef7"],
  ["#1a1014", "#ff7a59", "#77d8ff", "#f8f2ec"],
];

const episodeTitles = [
  "雨後白塔",
  "第零次問候",
  "被保存的哭聲",
  "記憶修復師",
  "近人測試",
  "疼痛交易所",
  "失眠的機房",
  "夏岑的備份",
  "白塔聽證",
  "寧的謊言",
  "人類格式化",
  "城市暫停",
  "情感黑市",
  "議會的臉",
  "協議破口",
  "最後一份人證",
  "痛苦的授權",
  "白塔熄燈",
  "近人之名",
  "明日仍像人",
];

const panelMoods = [
  "rain-slick street",
  "memory lab",
  "white tower silhouette",
  "subway archive",
  "ethics tribunal",
  "server cathedral",
  "rooftop signal",
  "market of memories",
  "council chamber",
  "dawn after shutdown",
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function panelSvg(ep, panel) {
  const colors = palette[(ep + panel) % palette.length];
  const title = episodeTitles[ep - 1];
  const mood = panelMoods[(panel - 1) % panelMoods.length];
  const orbX = 160 + ((ep * 53 + panel * 37) % 620);
  const towerX = 300 + ((ep * 29) % 140);
  const figureX = 170 + ((panel * 41) % 300);
  const isClose = panel % 3 === 0;
  const maskId = `m${ep}-${panel}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1620" viewBox="0 0 1080 1620" role="img" aria-label="近人協議 第${ep}集 第${panel}格 ${esc(title)}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="${colors[0]}"/>
      <stop offset="48%" stop-color="#0b1721"/>
      <stop offset="100%" stop-color="#201017"/>
    </linearGradient>
    <radialGradient id="light" cx="${orbX / 1080}" cy="0.28" r="0.62">
      <stop offset="0%" stop-color="${colors[1]}" stop-opacity="0.58"/>
      <stop offset="45%" stop-color="${colors[2]}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${colors[0]}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
    <mask id="${maskId}">
      <rect width="1080" height="1620" fill="white"/>
      <path d="M0 1340 C220 1240 430 1380 650 1280 C820 1200 945 1260 1080 1190 L1080 1620 L0 1620Z" fill="black" opacity="0.26"/>
    </mask>
  </defs>
  <rect width="1080" height="1620" fill="url(#bg)"/>
  <rect width="1080" height="1620" fill="url(#light)"/>
  <g mask="url(#${maskId})">
    <g opacity="0.52">
      ${Array.from({ length: 12 }, (_, i) => {
        const x = (i * 109 + ep * 17) % 1080;
        const h = 260 + ((i * 83 + panel * 29) % 620);
        return `<rect x="${x}" y="${980 - h}" width="${46 + (i % 4) * 18}" height="${h}" fill="#d9f7ff" opacity="${0.05 + (i % 5) * 0.025}"/>`;
      }).join("")}
    </g>
    <path d="M${towerX} 1520 L${towerX + 92} 250 L${towerX + 184} 1520Z" fill="#f8fbff" opacity="0.16"/>
    <path d="M${towerX + 78} 1520 L${towerX + 94} 330 L${towerX + 110} 1520Z" fill="${colors[1]}" opacity="0.26"/>
    <g opacity="0.78">
      ${Array.from({ length: 26 }, (_, i) => {
        const y = 140 + i * 54;
        return `<path d="M0 ${y} C220 ${y + 40} 410 ${y - 34} 630 ${y + 16} S910 ${y + 42} 1080 ${y - 20}" fill="none" stroke="${i % 2 ? colors[1] : colors[2]}" stroke-width="${i % 4 === 0 ? 2 : 1}" opacity="${0.06 + (i % 4) * 0.025}"/>`;
      }).join("")}
    </g>
    <g transform="translate(${figureX} ${isClose ? 640 : 840}) scale(${isClose ? 1.55 : 1})">
      <ellipse cx="130" cy="520" rx="130" ry="30" fill="#000" opacity="0.36" filter="url(#soft)"/>
      <path d="M88 164 C118 118 176 120 204 166 C222 198 216 256 184 280 C150 304 104 286 84 244 C72 220 72 188 88 164Z" fill="#e8dfd4" opacity="0.92"/>
      <path d="M84 158 C118 116 178 114 214 154 C174 146 136 152 98 184Z" fill="#15161a"/>
      <path d="M98 288 C142 326 184 318 214 286 L278 560 L24 560Z" fill="#111820"/>
      <path d="M116 332 C152 378 180 408 220 440" fill="none" stroke="${colors[1]}" stroke-width="8" opacity="0.42"/>
      <path d="M220 180 C270 180 316 214 342 268 C364 314 362 384 330 436 C306 474 268 494 222 492" fill="none" stroke="${colors[2]}" stroke-width="11" opacity="0.54"/>
      <circle cx="156" cy="214" r="7" fill="${colors[1]}"/>
      <rect x="114" y="196" width="86" height="10" rx="5" fill="#02131d" opacity="0.62"/>
    </g>
    <g transform="translate(${figureX + 330} ${isClose ? 595 : 790}) scale(${isClose ? 1.58 : 1})" opacity="0.94">
      <ellipse cx="132" cy="548" rx="118" ry="28" fill="#000" opacity="0.28" filter="url(#soft)"/>
      <path d="M82 154 C112 104 184 106 216 156 C238 190 232 252 198 282 C162 314 110 292 86 246 C74 222 70 184 82 154Z" fill="#f4f6fb" opacity="0.95"/>
      <path d="M86 150 C120 102 182 98 224 150 C196 132 140 130 98 172Z" fill="#cfd9e6"/>
      <path d="M96 290 C136 334 186 334 222 292 L300 570 L18 570Z" fill="#edf8ff" opacity="0.28"/>
      <path d="M128 184 L210 244 M116 222 L184 296 M142 318 L244 468" stroke="${colors[1]}" stroke-width="7" stroke-linecap="round" opacity="0.58"/>
      <circle cx="154" cy="214" r="8" fill="${colors[2]}"/>
      <circle cx="190" cy="214" r="8" fill="${colors[1]}"/>
    </g>
  </g>
  <rect x="64" y="70" width="214" height="44" rx="22" fill="#03070a" opacity="0.62"/>
  <text x="91" y="101" fill="${colors[3]}" font-family="'Noto Sans TC','Microsoft JhengHei',Arial,sans-serif" font-size="23" font-weight="700">EP ${String(ep).padStart(2, "0")} / ${String(panel).padStart(2, "0")}</text>
  <text x="64" y="1390" fill="${colors[3]}" font-family="'Noto Serif TC','Noto Sans TC','Microsoft JhengHei',serif" font-size="56" font-weight="700" letter-spacing="2">${esc(title)}</text>
  <text x="66" y="1452" fill="${colors[1]}" font-family="'Noto Sans TC','Microsoft JhengHei',Arial,sans-serif" font-size="27" opacity="0.92">${esc(mood)} · 近人協議視覺檔案</text>
  <path d="M64 1494 H1016" stroke="${colors[2]}" stroke-width="3" opacity="0.42"/>
</svg>`;
}

ensureDir(comicDir);
for (let ep = 1; ep <= 20; ep += 1) {
  const epDir = path.join(comicDir, `ep-${String(ep).padStart(2, "0")}`);
  ensureDir(epDir);
  for (let panel = 1; panel <= 10; panel += 1) {
    fs.writeFileSync(path.join(epDir, `panel-${String(panel).padStart(2, "0")}.svg`), panelSvg(ep, panel));
  }
}

ensureDir(iconsDir);
const iconSource = path.join(assetDir, "app-icon-source.png");
if (fs.existsSync(iconSource)) {
  await Promise.all([
    sharp(iconSource).resize(192, 192).png().toFile(path.join(iconsDir, "icon-192.png")),
    sharp(iconSource).resize(512, 512).png().toFile(path.join(iconsDir, "icon-512.png")),
    sharp(iconSource).resize(180, 180).png().toFile(path.join(iconsDir, "apple-touch-icon.png")),
    sharp(iconSource).resize(48, 48).png().toFile(path.join(publicDir, "favicon-48.png")),
  ]);
}

console.log("Generated 200 comic panels and PWA icons.");
