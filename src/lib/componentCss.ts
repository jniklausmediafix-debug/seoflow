export const COMPONENT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&family=Bitter:wght@600;700&display=swap');

.mf-faq {
  max-width: 680px;
  width: 100%;
  margin: 0 0 32px 0 !important;
  padding: 0 !important;
}

.mf-faq__headline {
  font-family: 'Bitter', serif !important;
  font-size: 20px !important;
  font-weight: 700 !important;
  color: #222 !important;
  margin-bottom: 16px !important;
  display: -webkit-box !important;
  display: -ms-flexbox !important;
  display: flex !important;
  -webkit-box-align: center !important;
  -ms-flex-align: center !important;
  align-items: center !important;
  gap: 10px !important;
}

.mf-faq__headline::before {
  content: '' !important;
  display: block !important;
  width: 16px !important;
  height: 16px !important;
  min-width: 16px !important;
  background: #90AD25 !important;
  clip-path: polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%, 0 0) !important;
  -webkit-clip-path: polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%, 0 0) !important;
  flex-shrink: 0 !important;
}

.mf-faq__item {
  background: #ffffff !important;
  border: 1px solid #d8d8d8 !important;
  border-left: 3px solid transparent !important;
  border-radius: 3px !important;
  margin-bottom: 6px !important;
  padding: 0 !important;
  transition: border-left-color 0.2s, box-shadow 0.2s !important;
  overflow: hidden !important;
}

.mf-faq__item.open {
  border-left-color: #90AD25 !important;
  box-shadow: 0 2px 10px rgba(106,176,76,0.10) !important;
}

.mf-faq__question {
  display: -webkit-box !important;
  display: -ms-flexbox !important;
  display: flex !important;
  -webkit-box-align: center !important;
  -ms-flex-align: center !important;
  align-items: center !important;
  -webkit-box-pack: justify !important;
  -ms-flex-pack: justify !important;
  justify-content: space-between !important;
  gap: 12px !important;
  padding: 14px 18px !important;
  margin: 0 !important;
  cursor: pointer !important;
  user-select: none !important;
  background: #fff !important;
  transition: background 0.15s !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.mf-faq__question:hover {
  background: #f5fbf2 !important;
}

.mf-faq__item.open .mf-faq__question {
  background: #f5fbf2 !important;
  border-bottom: 1px solid #e8f5e0 !important;
}

.mf-faq__q-text {
  font-family: 'Source Sans 3', sans-serif !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  color: #1a1a1a !important;
  line-height: 1.4 !important;
  flex: 1 !important;
  -webkit-box-flex: 1 !important;
  -ms-flex: 1 !important;
  margin: 0 !important;
  padding: 0 !important;
}

.mf-faq__item.open .mf-faq__q-text {
  color: #6d8418 !important;
}

.mf-faq__icon {
  width: 24px !important;
  min-width: 24px !important;
  height: 24px !important;
  border-radius: 50% !important;
  border: 2px solid #ccc !important;
  display: -webkit-box !important;
  display: -ms-flexbox !important;
  display: flex !important;
  -webkit-box-align: center !important;
  -ms-flex-align: center !important;
  align-items: center !important;
  -webkit-box-pack: center !important;
  -ms-flex-pack: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  -ms-flex-negative: 0 !important;
  transition: border-color 0.2s, background 0.2s !important;
  box-sizing: border-box !important;
  color: #90AD25 !important;
  font-size: 18px !important;
  font-weight: 300 !important;
  line-height: 1 !important;
}

.mf-faq__item.open .mf-faq__icon {
  border-color: #90AD25 !important;
  background: #90AD25 !important;
  color: #fff !important;
}

.mf-faq__answer {
  max-height: 0 !important;
  overflow: hidden !important;
  transition: max-height 0.35s ease, opacity 0.25s ease !important;
  opacity: 0 !important;
}

.mf-faq__item.open .mf-faq__answer {
  max-height: 600px !important;
  opacity: 1 !important;
}

.mf-faq__a-inner {
  padding: 14px 18px 16px !important;
  font-size: 14px !important;
  color: #444 !important;
  line-height: 1.7 !important;
  margin: 0 !important;
}

.mf-faq__a-inner strong {
  color: #222 !important;
}

.mf-faq__a-inner a {
  color: #90AD25 !important;
  text-decoration: none !important;
  font-weight: 600 !important;
  border-bottom: 1px solid #b8dfa0 !important;
}

.mf-faq__a-inner a:hover {
  color: #6d8418 !important;
  border-color: #90AD25 !important;
}

.mf-faq__note {
  background: #f5fbf2 !important;
  border-left: 3px solid #90AD25 !important;
  padding: 10px 14px !important;
  margin-top: 10px !important;
  border-radius: 0 3px 3px 0 !important;
  font-size: 13px !important;
  color: #6d8418 !important;
}

/* ===== TOC v2 (MEDIAFIX – Open Sans, Gradient-Bar, kein Toggle) ===== */
.mf-toc {
  background: #ffffff;
  border: 1px solid #ededed;
  border-radius: 3px;
  max-width: 520px;
  width: 100%;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  font-family: 'Open Sans', sans-serif;
  margin-bottom: 24px;
  position: relative;
}

.mf-toc::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #90ad25 0%, #f7b91f 50%, #eb5a37 100%);
}

.mf-toc__header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 18px 13px;
  border-bottom: 1px solid #ededed;
  user-select: none;
}

.mf-toc__title {
  display: flex;
  align-items: center;
  text-align: center;
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #421e47;
  letter-spacing: 0.01em;
}

.mf-toc__toggle {
  display: none !important;
}

.mf-toc__body {
  padding: 10px 0 14px;
}

.mf-toc__list {
  list-style: none;
  margin: 0;
  padding: 0;
  counter-reset: toc-counter;
}

.mf-toc__item {
  counter-increment: toc-counter;
  border-bottom: 1px solid #f2f2f2;
}

.mf-toc__item:last-child {
  border-bottom: none;
}

.mf-toc__link {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 8px 18px;
  text-decoration: none;
  color: #333333;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  transition: background 0.15s, color 0.15s;
}

.mf-toc__link::before {
  content: counter(toc-counter) ".";
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #90ad25;
  min-width: 22px;
  flex-shrink: 0;
  line-height: 1.5;
}

.mf-toc__link:hover {
  background: #f4f7e8;
  color: #421e47;
}

.mf-toc__link:hover .mf-toc__arrow {
  transform: translateX(3px);
  opacity: 1;
}

.mf-toc__text { flex: 1; }

.mf-toc__arrow {
  font-size: 11px;
  color: #90ad25;
  opacity: 0;
  transition: transform 0.2s, opacity 0.2s;
  flex-shrink: 0;
}

.mf-toc__item--highlight .mf-toc__link {
  font-weight: 700;
  color: #1a1a1a;
}

.mf-toc__footer {
  display: none !important;
}

/* ===== TOC v1 (alt – Source Sans 3/Bitter, Toggle, Reading-Time) =====
.mf-toc {
  background: #ffffff;
  border: 1px solid #d8d8d8;
  border-top: 4px solid #90AD25;
  border-radius: 3px;
  max-width: 520px;
  width: 100%;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  font-family: 'Source Sans 3', sans-serif;
  margin-bottom: 24px;
}
.mf-toc__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px 12px; border-bottom: 1px solid #e8e8e8;
  cursor: pointer; user-select: none;
}
.mf-toc__title {
  display: flex; align-items: center; gap: 9px;
  font-family: 'Bitter', serif; font-size: 15px; font-weight: 700;
  color: #222222; letter-spacing: 0.01em;
}
.mf-toc__title::before {
  content: ''; display: block; width: 16px; height: 16px;
  background: #90AD25;
  clip-path: polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%, 0 0);
  flex-shrink: 0;
}
.mf-toc__toggle {
  font-size: 11px; color: #90AD25; font-weight: 600;
  letter-spacing: 0.04em; text-transform: uppercase;
  display: flex; align-items: center; gap: 4px; transition: color 0.2s;
}
.mf-toc__toggle::after { content: '▲'; font-size: 8px; transition: transform 0.3s ease; }
.mf-toc.collapsed .mf-toc__toggle::after { transform: rotate(180deg); }
.mf-toc__header:hover .mf-toc__toggle { color: #6d8418; }
.mf-toc__body {
  padding: 10px 0 14px; overflow: hidden;
  max-height: 800px; transition: max-height 0.35s ease, opacity 0.25s ease; opacity: 1;
}
.mf-toc.collapsed .mf-toc__body { max-height: 0; opacity: 0; padding: 0; }
.mf-toc__list { list-style: none; margin: 0; padding: 0; counter-reset: toc-counter; }
.mf-toc__item { counter-increment: toc-counter; border-bottom: 1px solid #f0f0f0; }
.mf-toc__item:last-child { border-bottom: none; }
.mf-toc__link {
  display: flex; align-items: baseline; gap: 10px; padding: 8px 18px;
  text-decoration: none; color: #2a2a2a; font-size: 14px; font-weight: 400;
  line-height: 1.4; transition: background 0.15s, color 0.15s;
}
.mf-toc__link::before {
  content: counter(toc-counter) "."; font-family: 'Bitter', serif;
  font-size: 13px; font-weight: 700; color: #90AD25; min-width: 22px;
  flex-shrink: 0; line-height: 1.5;
}
.mf-toc__link:hover { background: #f5fbf2; color: #6d8418; }
.mf-toc__link:hover .mf-toc__arrow { transform: translateX(3px); opacity: 1; }
.mf-toc__text { flex: 1; }
.mf-toc__arrow { font-size: 11px; color: #90AD25; opacity: 0; transition: transform 0.2s, opacity 0.2s; flex-shrink: 0; }
.mf-toc__item--highlight .mf-toc__link { font-weight: 600; color: #1a1a1a; }
.mf-toc__footer { padding: 8px 18px 0; border-top: 1px solid #eeeeee; margin-top: 2px; }
.mf-toc__meta { font-size: 11px; color: #aaaaaa; display: flex; align-items: center; gap: 5px; }
.mf-toc__meta::before { content: '🕐'; font-size: 10px; }
===== Ende TOC v1 ===== */

.mf-steps {
  margin: 1.5em 0;
}

.mf-step {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.mf-step__num {
  font-size: 40px;
  color: #90ad25;
  font-weight: 800;
  min-width: 44px;
  text-align: center;
  line-height: 1.1;
  flex-shrink: 0;
}

.mf-step__content {
  flex: 1;
  padding-top: 6px;
}

.mf-expert {
  max-width: 680px !important;
  width: 100% !important;
  background: #ffffff !important;
  border: 1px solid #d8d8d8 !important;
  border-radius: 3px !important;
  overflow: hidden !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07) !important;
  position: relative !important;
  margin: 24px 0 !important;
  box-sizing: border-box !important;
}

.mf-expert::before {
  content: '' !important;
  display: block !important;
  height: 4px !important;
  background: #90AD25 !important;
  width: 100% !important;
}

.mf-expert__inner {
  display: -webkit-box !important;
  display: -ms-flexbox !important;
  display: flex !important;
  -webkit-box-align: stretch !important;
  -ms-flex-align: stretch !important;
  align-items: stretch !important;
}

.mf-expert__sidebar {
  background: #90AD25 !important;
  width: 110px !important;
  min-width: 110px !important;
  display: -webkit-box !important;
  display: -ms-flexbox !important;
  display: flex !important;
  -webkit-box-orient: vertical !important;
  -webkit-box-direction: normal !important;
  -ms-flex-direction: column !important;
  flex-direction: column !important;
  -webkit-box-align: center !important;
  -ms-flex-align: center !important;
  align-items: center !important;
  -webkit-box-pack: start !important;
  -ms-flex-pack: start !important;
  justify-content: flex-start !important;
  padding: 22px 12px 20px !important;
  gap: 10px !important;
  flex-shrink: 0 !important;
}

.mf-expert__avatar {
  width: 64px !important;
  height: 64px !important;
  border-radius: 50% !important;
  background: #ffffff !important;
  display: -webkit-box !important;
  display: -ms-flexbox !important;
  display: flex !important;
  -webkit-box-align: center !important;
  -ms-flex-align: center !important;
  align-items: center !important;
  -webkit-box-pack: center !important;
  -ms-flex-pack: center !important;
  justify-content: center !important;
  font-family: 'Bitter', serif !important;
  font-size: 22px !important;
  font-weight: 700 !important;
  color: #90AD25 !important;
  border: 3px solid rgba(255,255,255,0.6) !important;
  overflow: hidden !important;
  flex-shrink: 0 !important;
  box-sizing: border-box !important;
}

.mf-expert__avatar img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  border-radius: 50% !important;
}

.mf-expert__badge {
  background: rgba(255,255,255,0.2) !important;
  border: 1px solid rgba(255,255,255,0.4) !important;
  border-radius: 3px !important;
  padding: 3px 7px !important;
  font-size: 9px !important;
  font-weight: 700 !important;
  letter-spacing: 1px !important;
  text-transform: uppercase !important;
  color: #fff !important;
  text-align: center !important;
  line-height: 1.3 !important;
}

.mf-expert__body {
  -webkit-box-flex: 1 !important;
  -ms-flex: 1 !important;
  flex: 1 !important;
  padding: 20px 22px !important;
  border-left: 1px solid #e8e8e8 !important;
  box-sizing: border-box !important;
}

.mf-expert__label {
  font-size: 10px !important;
  font-weight: 700 !important;
  letter-spacing: 1.8px !important;
  text-transform: uppercase !important;
  color: #90AD25 !important;
  margin: 0 0 6px 0 !important;
  display: -webkit-box !important;
  display: -ms-flexbox !important;
  display: flex !important;
  -webkit-box-align: center !important;
  -ms-flex-align: center !important;
  align-items: center !important;
  gap: 6px !important;
}

.mf-expert__label::before {
  content: '' !important;
  display: block !important;
  width: 12px !important;
  height: 12px !important;
  min-width: 12px !important;
  background: #90AD25 !important;
  clip-path: polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%, 0 0) !important;
  -webkit-clip-path: polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%, 0 0) !important;
}

.mf-expert__name {
  font-family: 'Bitter', serif !important;
  font-size: 17px !important;
  font-weight: 700 !important;
  color: #1a1a1a !important;
  margin: 0 0 2px 0 !important;
  line-height: 1.3 !important;
  padding: 0 !important;
}

.mf-expert__title {
  font-size: 12px !important;
  color: #888 !important;
  margin: 0 0 14px 0 !important;
  font-weight: 400 !important;
  padding: 0 !important;
}

.mf-expert__divider {
  height: 1px !important;
  background: #eeeeee !important;
  margin-bottom: 14px !important;
  border: none !important;
}

.mf-expert__quote {
  font-size: 14px !important;
  color: #333 !important;
  line-height: 1.7 !important;
  margin: 0 !important;
  padding: 0 !important;
  font-style: italic !important;
}

.mf-expert__quote-mark {
  font-family: 'Bitter', serif !important;
  font-size: 48px !important;
  color: #f0f5d6 !important;
  line-height: 0.8 !important;
  display: block !important;
  margin-bottom: 4px !important;
  font-style: normal !important;
}

@media (max-width: 520px) {
  .mf-expert__inner {
    -webkit-box-orient: vertical !important;
    -webkit-box-direction: normal !important;
    -ms-flex-direction: column !important;
    flex-direction: column !important;
  }
  .mf-expert__sidebar {
    width: 100% !important;
    -webkit-box-orient: horizontal !important;
    -webkit-box-direction: normal !important;
    -ms-flex-direction: row !important;
    flex-direction: row !important;
    padding: 14px 18px !important;
  }
  .mf-expert__body {
    border-left: none !important;
    border-top: 1px solid #e8e8e8 !important;
  }
}

a.button {
  display: inline-block !important;
  margin-top: 24px !important;
}
`.trim();
