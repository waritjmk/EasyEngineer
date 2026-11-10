// Build: content.json + src/ -> docs/index.html (th) and docs/en/index.html (en)
// Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, "docs");
const content = JSON.parse(readFileSync(join(root, "content.json"), "utf8"));
const css = readFileSync(join(root, "src/styles.css"), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{};:,>])\s*/g, "$1").trim();
const { site } = content;
const base = (site.url || "").replace(/\/$/, "");
const LANGS = { th: "", en: "en/" };

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// escape, then make [TODO: ...] placeholders visible
const t = (s) => esc(s).replace(/\[TODO:[^\]]*\]/g, (m) => `<span class="todo">${m}</span>`);

function page(lang) {
  const c = content[lang];
  const other = lang === "th" ? "en" : "th";
  const up = lang === "th" ? "./" : "../";
  const url = (l) => (base ? `${base}/${LANGS[l]}` : `${up}${LANGS[l]}`);
  const href = (key) => {
    const v = site.links[key];
    return v ? (key === "email" ? `mailto:${v}` : v) : "";
  };
  const ext = (label, key, cls = "btn") => {
    const h = href(key);
    if (!h) return `<span class="btn btn--todo">${esc(label)}<small>[TODO: ${esc(c.ui.todoLink)}]</small></span>`;
    const blank = key === "email" ? "" : ` target="_blank" rel="noopener"`;
    return `<a class="${cls}" href="${esc(h)}"${blank}>${esc(label)}${blank ? `<span class="vh"> ${esc(c.ui.newTab)}</span>` : ""}</a>`;
  };
  const tag = (n, label) => `<p class="mono sheet__tag">${esc(c.ui.sheet)} ${n} / ${esc(label)}</p>`;
  const facts = (rows) => `<dl class="facts">${rows.map(([k, v]) => `<dt class="mono">${t(k)}</dt><dd>${t(v)}</dd>`).join("")}</dl>`;
  const ticks = (rows) => `<ul class="ticks">${rows.map((r) => `<li>${t(r)}</li>`).join("")}</ul>`;
  const { hero, course, work, hire, contact } = c;
  const b = course.board;

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(c.meta.title)}</title>
<meta name="description" content="${esc(c.meta.description)}">
<meta name="theme-color" content="#0B1220">
${base ? `<link rel="canonical" href="${url(lang)}">` : ""}
<link rel="alternate" hreflang="th" href="${url("th")}">
<link rel="alternate" hreflang="en" href="${url("en")}">
<link rel="alternate" hreflang="x-default" href="${url("th")}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(c.meta.title)}">
<meta property="og:description" content="${esc(c.meta.description)}">
<meta property="og:locale" content="${lang === "th" ? "th_TH" : "en_US"}">
${base ? `<meta property="og:url" content="${url(lang)}">\n<meta property="og:image" content="${base}/assets/logo-ez-300.png">` : ""}
<link rel="icon" href="${up}assets/logo-ez-96.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="${FONTS}"></noscript>
<style>${css}</style>
<script>if("IntersectionObserver" in window)document.documentElement.classList.add("js")</script>
<script src="${up}assets/main.js" defer></script>
</head>
<body>
<a class="skip" href="#main">${esc(c.ui.skip)}</a>
<header class="top">
  <div class="wrap top__in">
    <a class="brand" href="${up}${LANGS[lang]}">
      <picture><source srcset="${up}assets/logo-ez-96.webp" type="image/webp"><img src="${up}assets/logo-ez-96.png" width="40" height="40" alt="${esc(c.ui.logoAlt)}"></picture>
      <span>${esc(site.brand)}</span>
    </a>
    <nav class="nav" aria-label="${esc(c.ui.navLabel)}"><ul>
      ${c.nav.map((n) => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join("")}
    </ul></nav>
    <div class="lang" role="group" aria-label="${esc(c.ui.langLabel)}">
      ${["th", "en"].map((l) => l === lang
        ? `<span aria-current="true" lang="${l}">${l.toUpperCase()}</span>`
        : `<a href="${up}${LANGS[l]}" hreflang="${l}" lang="${l}">${l.toUpperCase()}<span class="vh"> ${l === "th" ? "ภาษาไทย" : "English"}</span></a>`).join("")}
    </div>
  </div>
</header>

<main id="main">
<section class="hero">
  ${RULERS}
  <div class="wrap">
    ${SKETCHES}
    <div class="hero__grid">
      <div class="hero__text">
        <p class="mono">${esc(hero.eyebrow)}</p>
        <h1><span>${t(hero.title[0])}</span> <span class="mark">${t(hero.title[1])}${UNDERLINE}</span>${hero.title[2] ? ` <span>${t(hero.title[2])}</span>` : ""}</h1>
        <p class="hook">${hero.hook.map((l) => `<span>${t(l)}</span>`).join(" ")}</p>
        <details class="more"><summary><span>${esc(hero.moreLabel)}</span><svg viewBox="0 0 12 8" width="12" height="8" aria-hidden="true" focusable="false"><path d="M1 1l5 5 5-5"/></svg></summary><div>${hero.more.map((p) => `<p>${t(p)}</p>`).join("")}</div></details>
        <div class="btns"><a class="btn btn--solid btn--hook" href="#course">${esc(hero.cta)} <span class="go" aria-hidden="true">→</span></a><a class="btn" href="#work">${esc(hero.cta2)}</a></div>
      </div>
      <div class="stage">
        <div class="viz">
          <div class="halo"></div>
          <svg class="spin" viewBox="0 0 420 420" aria-hidden="true" focusable="false"><circle class="dial tk" cx="200" cy="210" r="166"/></svg>
          <svg class="spin spin--rev" viewBox="0 0 420 420" aria-hidden="true" focusable="false"><circle class="dial orbit" cx="200" cy="210" r="184"/></svg>
          ${CIRCUIT}
          <picture><source srcset="${up}assets/logo-ez-300.webp" type="image/webp"><img src="${up}assets/logo-ez-300.png" width="300" height="300" alt="" fetchpriority="high"></picture>
        </div>
        <nav class="paths" aria-label="${esc(hero.pathsLabel)}">
          ${hero.paths.map((p, i) => `<a class="path" href="${p.href}">${icon(["chip", "chat"][i])}<span class="path__txt"><span class="mono">${esc(p.tag)}</span><strong>${t(p.title)}</strong><span>${t(p.desc)}</span></span><span class="path__go" aria-hidden="true">→</span></a>`).join("")}
        </nav>
      </div>
    </div>
  </div>
  <ul class="strip">
    ${hero.strip.map((s) => `<li>${icon(s.icon)}<div><strong>${t(s.title)}</strong><span>${t(s.desc)}</span></div></li>`).join("")}
  </ul>
</section>

<section class="sheet" id="course" aria-labelledby="course-h">
  <div class="wrap reveal">
    ${tag("01", course.tag)}
    <h2 id="course-h">${t(course.title)}</h2>
    <p class="lead">${t(course.lead)}</p>
    <div class="cols">
      <div>
        ${ticks(course.points)}
        ${facts(course.facts)}
      </div>
      <div>
        <div class="card card--accent">
          <h3>${t(course.wait.title)}</h3>
          <p>${t(course.wait.body)}</p>
          <p><strong>${t(course.wait.privacy)}</strong></p>
          <div class="btns">${ext(course.wait.form, "form", "btn btn--solid")}${ext(course.wait.line, "line")}${ext(course.wait.email, "email")}</div>
        </div>
      ${!site.showBoard ? "" : `<div class="lab" style="margin-top:24px">
        <h3>${t(b.title)}</h3>
        <p id="board-hint">${t(b.hint)}</p>
        <div class="board" data-board data-on="${esc(b.on)}" data-off="${esc(b.off)}">
          ${BOARD}
          <button class="board__btn" type="button" aria-pressed="false" aria-label="${esc(b.button)}" aria-describedby="board-hint"></button>
        </div>
        <p class="readout" role="status"><span>${esc(b.btnLabel)} (BTN) = <b data-btn>LOW</b></span><span>${esc(b.ledLabel)} = <b data-led>${esc(b.off)}</b></span></p>
        <pre class="code" lang="en"><code>void loop() {
  <span class="hl">digitalWrite(LED, digitalRead(BTN));</span>
}</code></pre>
        <p>${t(b.explain)}</p>
      </div>`}
      </div>
    </div>
  </div>
</section>

<section class="sheet work" id="work" aria-labelledby="work-h">
  <div class="wrap">
    ${tag("02", work.tag)}
    <h2 id="work-h">${t(work.title)}</h2>
    <p class="lead">${t(work.lead)}</p>
    ${work.groups.map((g) => `<div class="group reveal">
      <div class="group__head"><span class="mono">${esc(g.code)}</span><h3>${t(g.title)}</h3></div>
      <p>${t(g.desc)}</p>
      <div class="grid3">${g.items.map((i) => `<article class="card"><h4>${t(i.title)}</h4><p>${t(i.desc)}</p>${i.link ? ext(i.cta, i.link) : ""}</article>`).join("")}</div>
    </div>`).join("")}
  </div>
</section>

<section class="sheet" id="hire" aria-labelledby="hire-h">
  <div class="wrap reveal">
    ${tag("03", hire.tag)}
    <h2 id="hire-h">${t(hire.title)}</h2>
    <p class="lead">${t(hire.lead)}</p>
    <div class="grid3" style="margin-top:32px">${hire.items.map((i) => `<article class="card">${icon(i.icon)}<h3>${t(i.title)}</h3><p>${t(i.desc)}</p></article>`).join("")}</div>
    <div class="cols">
      <div><p class="mono">${esc(hire.stepsLabel)}</p><ol class="steps">${hire.steps.map((s) => `<li>${t(s)}</li>`).join("")}</ol></div>
      <div><p>${t(hire.note)}</p><p style="margin-top:16px"><a class="btn btn--solid" href="#contact">${esc(hire.cta)}</a></p></div>
    </div>
  </div>
</section>

<section class="sheet" id="contact" aria-labelledby="contact-h">
  <div class="wrap reveal">
    ${tag("04", contact.tag)}
    <h2 id="contact-h">${t(contact.title)}</h2>
    <p class="lead">${t(contact.lead)}</p>
    <div class="cols">
      <div>
        <div class="btns">${ext(contact.line, "line", "btn btn--solid")}${ext(contact.email, "email")}${ext(contact.youtube, "youtube")}${ext(contact.tiktok, "tiktok")}</div>
        <h3 style="margin-top:32px">${t(contact.aboutTitle)}</h3>
        <p class="lead" style="margin-top:8px">${t(contact.about)}</p>
      </div>
      <div class="photo">${t(contact.photo)}</div>
    </div>
  </div>
</section>
</main>

<footer class="foot"><div class="wrap"><span>© ${new Date().getFullYear()} ${esc(site.brand)}</span><span>${t(c.footer)}</span></div></footer>
</body>
</html>
`;
}

const FONTS = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&amp;family=IBM+Plex+Sans+Thai:wght@400;600&amp;display=swap";

// Highlight 1: circuit that draws itself around the logo disc (decorative; real links are .paths)
const d = (delay, dur) => `class="w draw" pathLength="1" style="--d:${delay}s;--t:${dur}s"`;
const CIRCUIT = `<svg viewBox="0 0 420 420" aria-hidden="true" focusable="false">
  <defs><radialGradient id="g"><stop offset="0" stop-color="#F2E3B6" stop-opacity=".9"/><stop offset="1" stop-color="#F2E3B6" stop-opacity="0"/></radialGradient></defs>
  <circle ${d(0, 0.9)} cx="200" cy="210" r="124" transform="rotate(-90 200 210)"/>
  <path ${d(0.5, 0.4)} d="M125 80A150 150 0 0 1 275 80"/><path class="w pop" style="--d:.9s" d="M131 90.500L119 69.700M269 90.500L281 69.700"/>
  <path ${d(0.7, 0.4)} d="M59 261A150 150 0 0 0 149 351"/><path class="w pop" style="--d:1.1s" d="M70 257L48 265M144 340L153 362"/>
  <path ${d(0.9, 0.25)} d="M76 210H44"/><path class="w pop" style="--d:1.15s" d="M44 194V226M34 202V218"/>
  <g class="trace">
    <circle class="glow" cx="371" cy="315" r="34" fill="url(#g)"/>
    <path ${d(1.0, 0.3)} d="M307 148L330 105H352"/>
    <path ${d(1.3, 0.3)} d="M352 105l6-11 10 22 10-22 10 22 6-11"/>
    <path ${d(1.6, 0.15)} d="M394 105H420"/>
    <path ${d(1.1, 0.3)} d="M307 272L330 315H360"/>
    <path ${d(1.4, 0.25)} d="M360 302V328L382 315Z"/><path ${d(1.65, 0.1)} d="M382 302V328"/>
    <path ${d(1.7, 0.15)} d="M382 315H420"/>
    <g class="pop" style="--d:1.85s"><circle class="ring" cx="420" cy="105" r="5"/><circle class="ring" cx="420" cy="315" r="5"/>
    <circle class="dot" cx="307" cy="148" r="4"/><circle class="dot" cx="307" cy="272" r="4"/></g>
    <g class="pop" style="--d:1.2s"><text x="360" y="84">R1</text><text x="352" y="352">LED1</text></g>
  </g>
  <g class="pop" style="--d:1.2s"><text x="178" y="14">Ø 220</text><text x="18" y="246">9V</text></g>
</svg>`;
// Faint background sketches (decorative): draw themselves, then drift slowly
const k = (delay, dur = 1.2) => `class="sk draw" pathLength="1" style="--d:${delay}s;--t:${dur}s"`;
const SKETCHES = `<div class="sketches" aria-hidden="true">
  <svg class="sketch sketch--rocket" viewBox="0 0 100 160" focusable="false">
    <path ${k(2.2)} d="M50 8C72 30 76 70 70 110H30C24 70 28 30 50 8Z"/><circle ${k(2.6, 0.6)} cx="50" cy="58" r="10"/>
    <path ${k(2.8, 0.6)} d="M30 92L12 124L30 114M70 92L88 124L70 114"/><path ${k(3, 0.5)} d="M38 110L42 122H58L62 110"/>
    <path class="sk pop" style="--d:3.4s" d="M44 124C42 138 50 152 50 152C50 152 58 138 56 124"/>
  </svg>
  <svg class="sketch sketch--robot" viewBox="0 0 120 150" focusable="false">
    <path ${k(2.4, 0.4)} d="M60 18V8"/><circle ${k(2.5, 0.3)} cx="60" cy="5" r="3"/>
    <rect ${k(2.6)} x="30" y="18" width="60" height="40" rx="6"/><circle ${k(3, 0.4)} cx="46" cy="36" r="5"/><circle ${k(3.1, 0.4)} cx="74" cy="36" r="5"/><path ${k(3.2, 0.3)} d="M48 49H72"/>
    <path ${k(3.2, 0.3)} d="M54 58V66M66 58V66"/><rect ${k(3.3)} x="24" y="66" width="72" height="50" rx="6"/><rect ${k(3.7, 0.5)} x="44" y="78" width="32" height="16"/>
    <path ${k(3.8, 0.6)} d="M24 76H10V104M96 76H110V104M44 116V140H34M76 116V140H86"/>
  </svg>
  <svg class="sketch sketch--board" viewBox="0 0 160 110" focusable="false">
    <rect ${k(2.8)} x="10" y="6" width="144" height="98" rx="6"/><rect ${k(3.2, 0.5)} x="1" y="18" width="24" height="20"/><rect ${k(3.3, 0.5)} x="1" y="72" width="20" height="18"/>
    <rect ${k(3.4, 0.6)} x="50" y="13" width="96" height="8"/><rect ${k(3.5, 0.6)} x="74" y="89" width="72" height="8"/>
    <rect ${k(3.6, 0.6)} x="68" y="52" width="72" height="22"/><circle ${k(3.9, 0.3)} cx="42" cy="40" r="5"/><path ${k(4, 0.4)} d="M42 45V62H68"/>
  </svg>
</div>`;
// Faint ruler scales along the hero edges (decorative)
const seq = (n) => Array.from({ length: n }, (_, i) => i);
const tx = seq(10).map((i) => `M${i * 8}.5 0v${i === 0 ? 14 : i === 5 ? 9 : 5}`).join("");
const ty = seq(10).map((i) => `M0 ${i * 8}.5h${i === 0 ? 14 : i === 5 ? 9 : 5}`).join("");
const RULERS = `<svg class="ruler ruler--x" width="2800" height="26" aria-hidden="true" focusable="false"><defs><pattern id="rx" width="80" height="26" patternUnits="userSpaceOnUse"><path d="${tx}"/></pattern></defs><rect width="2800" height="26" fill="url(#rx)"/>${seq(35).map((i) => `<text x="${i * 80 + 5}" y="23">${i * 10}</text>`).join("")}</svg>
  <svg class="ruler ruler--y" width="34" height="1600" aria-hidden="true" focusable="false"><defs><pattern id="ry" width="34" height="80" patternUnits="userSpaceOnUse"><path d="${ty}"/></pattern></defs><rect width="34" height="1600" fill="url(#ry)"/>${seq(20).slice(1).map((i) => `<text x="6" y="${i * 80 + 17}">${i * 10}</text>`).join("")}</svg>
  <svg class="ruler ruler--y ruler--r" width="34" height="1600" aria-hidden="true" focusable="false"><rect width="34" height="1600" fill="url(#ry)"/></svg>`;
const UNDERLINE = `<svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path ${d(0.3, 0.6)} d="M3 8C45 2 90 11 197 4"/></svg>`;
const ICONS = {
  chat: "M4 5h16v11H10l-6 4z", chip: "M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4",
  power: "M12 3v8M6.300 6.300a8 8 0 1 0 11.400 0", check: "M4 12l5 5L20 6", web: "M3 5h18v14H3zM3 9h18", play: "M4 4h16v16H4zM10 9l5 3-5 3z",
};
const icon = (k) => `<svg class="ico" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="${ICONS[k] || ICONS.check}"/></svg>`;

// Highlight 2: Arduino-style board. The real control is the <button> layered over (100,130).
const pins = (x, y, n) => Array.from({ length: n }, (_, i) => `<rect class="pin" x="${x + i * 14}" y="${y}" width="6" height="6"/>`).join("");
const BOARD = `<svg viewBox="0 0 400 260" aria-hidden="true" focusable="false">
  <defs><radialGradient id="lg"><stop offset="0" stop-color="#F2E3B6" stop-opacity=".9"/><stop offset="1" stop-color="#F2E3B6" stop-opacity="0"/></radialGradient></defs>
  <rect class="o" x="24" y="14" width="362" height="232" rx="10"/>
  <rect class="f" x="6" y="36" width="54" height="44"/><rect class="f" x="6" y="186" width="46" height="40"/>
  <rect class="f" x="136" y="24" width="232" height="14"/>${pins(142, 28, 16)}
  <rect class="f" x="192" y="222" width="176" height="14"/>${pins(198, 226, 12)}
  <rect class="f" x="190" y="150" width="170" height="44"/><text x="232" y="177">EZ-UNO R1</text>
  <circle class="o" cx="44" cy="130" r="5"/><circle class="o" cx="366" cy="204" r="5"/>
  <path class="trace" d="M100 96V70H310"/>
  <circle class="led-glow" cx="310" cy="84" r="40" fill="url(#lg)"/>
  <circle class="led" cx="310" cy="84" r="12"/><circle class="led-on" cx="310" cy="84" r="8"/>
  <text x="290" y="118">LED 13</text>
  <rect class="o" x="66" y="96" width="68" height="68" rx="4"/>
  <text x="80" y="184">BTN 2</text>
</svg>`;

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "en"), { recursive: true });
cpSync(join(root, "src/assets"), join(out, "assets"), { recursive: true });
cpSync(join(root, "src/main.js"), join(out, "assets/main.js"));
writeFileSync(join(out, ".nojekyll"), "");
for (const lang of Object.keys(LANGS)) {
  const html = page(lang);
  writeFileSync(join(out, LANGS[lang], "index.html"), html);
  const todos = (html.match(/\[TODO:/g) || []).length;
  console.log(`${lang}: docs/${LANGS[lang]}index.html  ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB  (${todos} TODO)`);
}
if (!base) console.warn("site.url is empty: hreflang links are relative. Set it in content.json before going live.");
