export const COMPONENT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&family=Source+Sans+3:wght@400;600;700&family=Bitter:wght@600;700&display=swap');

/* ===== MEDIAFIX Artikel-Komponenten (Basis für TOC + FAQ) ===== */
:root {
  --mf-green-dark: #6f8817;
  --mf-text: #20231f;
  --mf-muted: #676d65;
  --mf-border: #e3e7df;
  --mf-hairline: #eceae4;
  --mf-surface-soft: #f7f8f5;
  --mf-radius: 5px;
  --mf-radius-inner: 4px;
  --mf-shadow: 0 1px 3px rgba(31, 39, 25, 0.04);
}

.article-component, .article-component * { box-sizing: border-box; }

html { scroll-behavior: smooth; interpolate-size: allow-keywords; }

.article-component {
  margin: 0 0 40px;
  padding: clamp(22px, 4vw, 34px);
  border: 1px solid var(--mf-border);
  border-radius: var(--mf-radius);
  background: #ffffff;
  box-shadow: var(--mf-shadow);
  color: var(--mf-text);
  line-height: 1.6;
}

.article-component .component-heading {
  display: flex;
  align-items: center;
  gap: 11px;
  margin: 0 0 22px;
}

.article-component .component-title {
  margin: 0;
  font-size: clamp(1.3rem, 2.6vw, 1.55rem);
  line-height: 1.25;
  letter-spacing: -0.02em;
}

/* ---- Inhaltsverzeichnis ---- */
.article-toc {
  position: relative;
  overflow: hidden;
  border-top: 0;
}

.article-toc::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #421e47, #1a7c98, #90ad25, #f7b91f, #eb5a37);
}

.article-toc ol {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: toc;
}

.article-toc li { counter-increment: toc; }

.article-toc a {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: baseline;
  gap: 12px;
  padding: 9px 12px;
  margin-inline: -12px;
  color: #333333 !important;
  font-weight: 650 !important;
  border-radius: var(--mf-radius-inner);
  text-decoration: none;
  transition: background-color .15s ease, color .15s ease;
}

.article-toc a::before {
  content: counter(toc, decimal) ".";
  color: var(--mf-green-dark);
  font-size: 1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.article-toc a:hover {
  background: var(--mf-surface-soft);
  color: var(--mf-green-dark) !important;
}

/* ---- Testimonial / Zitat-Box ---- */
.mfx-tm {
  --mfx-card: #f4f4f4;
  --mfx-text: #333333;
  --mfx-name: #333333;
  --mfx-role: #666666;
  --mfx-radius: 5px;
  --mfx-photo: 152px;

  box-sizing: border-box;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
}

.mfx-tm *,
.mfx-tm *::before,
.mfx-tm *::after { box-sizing: border-box; }

.mfx-tm .mfx-tm__card {
  display: flex;
  align-items: center;
  gap: clamp(24px, 4vw, 44px);
  padding: clamp(24px, 4vw, 44px);
  background: var(--mfx-card);
  border-radius: var(--mfx-radius);
}

.mfx-tm .mfx-tm__photo {
  flex: 0 0 var(--mfx-photo);
  width: var(--mfx-photo);
  height: var(--mfx-photo);
  overflow: hidden;
  background: #e2e4e8;
  border: none;
  border-radius: 50%;
}

.mfx-tm .mfx-tm__photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mfx-tm .mfx-tm__content {
  flex: 1 1 auto;
  min-width: 0;
}

.mfx-tm .mfx-tm__mark {
  display: block;
  width: clamp(38px, 4.5vw, 48px);
  margin: 0 0 18px;
}

.mfx-tm .mfx-tm__mark img {
  display: block;
  width: 100%;
  height: auto;
}

.mfx-tm .mfx-tm__quote {
  margin: 0 0 24px;
  color: var(--mfx-text);
  font-size: inherit;
  font-weight: 400;
  line-height: 1.6;
}

.mfx-tm .mfx-tm__name {
  margin: 0;
  color: var(--mfx-name);
  font-size: inherit;
  font-weight: 700;
  line-height: 1.5;
}

.mfx-tm .mfx-tm__role {
  margin: 4px 0 0;
  color: var(--mfx-role);
  font-size: inherit;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .mfx-tm { --mfx-photo: 104px; }

  .mfx-tm .mfx-tm__card {
    flex-direction: column;
    gap: 20px;
    padding: 24px;
    text-align: center;
  }

  .mfx-tm .mfx-tm__mark {
    width: 38px;
    margin: 0 auto 14px;
  }
}

/* ---- FAQ ---- */
.article-faq {
  background: #f2f2f2;
  position: relative;
  overflow: hidden;
  border-top: 0;
}

.article-faq::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #421e47, #1a7c98, #90ad25, #f7b91f, #eb5a37);
}

/* Theme-Kartenstyling neutralisieren: nur Haarlinien, transparent */
.article-faq .faq-item {
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border: 0 !important;
  border-top: 1px solid var(--mf-hairline) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
.article-faq .faq-item:first-child { border-top: 0 !important; }

.article-faq .faq-item summary,
.article-faq .faq-item .faq-answer { background: transparent !important; }

.article-faq .faq-item summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 20px;
  padding: 17px 0px;
  font-size: 1rem;
  font-weight: 650;
  line-height: 1.4;
  cursor: pointer;
  list-style: none;
  transition: color .15s ease;
}

.article-faq .faq-item summary:hover { color: var(--mf-green-dark); }

/* Chevron als reine CSS-Ecke (kein SVG/Data-URI, WordPress-sicher) */
.article-faq .faq-item summary::after {
  content: "";
  width: 11px;
  height: 11px;
  margin-right: 6px;
  border-right: 2.5px solid var(--mf-green-dark);
  border-bottom: 2.5px solid var(--mf-green-dark);
  transform: rotate(45deg);
  transition: transform .18s ease;
}

.article-faq .faq-item[open] summary::after {
  transform: rotate(-135deg);
}

/* Native + Theme-Marker/Pfeile unterdrücken */
.article-faq .faq-item summary::-webkit-details-marker { display: none; }
.article-faq .faq-item summary::before { content: none !important; }
.article-faq .faq-item summary::marker { content: ""; }

/* Frage und Antwort gleich einrücken */
.article-faq.article-component .faq-list .faq-item > summary,
.article-faq.article-component .faq-list .faq-item > .faq-answer {
  padding-left: 0px !important;
  margin-left: 0 !important;
  text-indent: 0 !important;
}
.article-faq .faq-item > .faq-answer > * {
  margin-left: 0 !important;
  padding-left: 0 !important;
}

.article-faq .faq-answer {
  padding: 0 40px 18px 4px;
  color: var(--mf-muted);
}

.article-faq .faq-answer p { margin: 0; }

/* ---- Fokus ---- */
.article-component a:focus-visible,
.article-faq .faq-item summary:focus-visible {
  outline: 3px solid rgba(144, 173, 37, 0.4);
  outline-offset: 2px;
  border-radius: var(--mf-radius-inner);
}

@media (max-width: 680px) {
  .article-faq .faq-answer { padding-right: 24px; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .article-component *,
  .article-component *::before,
  .article-component *::after { transition: none !important; }
}

/* Sanftes Auf-/Zuklappen */
.article-faq .faq-item::details-content {
  height: 0;
  overflow: hidden;
  transition: height .28s ease, content-visibility .28s;
  transition-behavior: allow-discrete;
}

.article-faq .faq-item[open]::details-content {
  height: auto;
}

@media (prefers-reduced-motion: reduce) {
  .article-faq .faq-item::details-content { transition: none; }
}

/* ===== MEDIAFIX INFO BOX (Klasse statt #info-ID → beliebig oft nutzbar) ===== */
.mf-info {
  background-color: #f2f2f2 !important;
  color: #333333 !important;
  border: 1px solid #90ad25 !important;
}

.mf-info i {
  color: #90ad25 !important;
}

.mf-info svg,
.mf-info svg path {
  fill: #90ad25 !important;
}

/* ===== MEDIAFIX STEPS / TIMELINE ===== */
.mf-steps {
  max-width: 680px;
  margin: 1.8em 0;
  font-family: 'Open Sans', sans-serif;
}

.mf-step {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  position: relative;
  padding-bottom: 22px;
}

/* vertikale Linie, die die Schritte verbindet */
.mf-step::before {
  content: '';
  position: absolute;
  left: 19px;
  top: 40px;
  bottom: -2px;
  width: 2px;
  background: #ededed;
}

.mf-step:last-child {
  padding-bottom: 0;
}

.mf-step:last-child::before {
  display: none;
}

.mf-step__num {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #90ad25;
  color: #ffffff;
  font-family: 'Open Sans', sans-serif;
  font-size: 18px;
  font-weight: 700;
  line-height: 40px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.mf-step__content {
  flex: 1;
  padding-top: 7px;
  font-size: inherit;
  line-height: 1.7;
  color: #333333;
}

.mf-step__content strong {
  display: block;
  margin-bottom: 3px;
  color: #421e47;
  font-weight: 700;
}

a.button {
  display: inline-block !important;
  margin-top: 24px !important;
}
`.trim();
