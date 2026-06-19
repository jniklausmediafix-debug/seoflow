export const COMPONENT_CSS = `
.mf-toc{background:#f8f9fa;border:1px solid #e5e7eb;border-radius:8px;margin:24px 0;overflow:hidden}
.mf-toc__header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;cursor:pointer;user-select:none;background:#fff}
.mf-toc__title{font-weight:700;font-size:15px;color:#1e293b}
.mf-toc__toggle{font-size:13px;color:#90ad25;font-weight:600}
.mf-toc__body{padding:12px 18px 16px}
.mf-toc.collapsed .mf-toc__body{display:none}
.mf-toc__list{list-style:none;margin:0;padding:0}
.mf-toc__item{border-bottom:1px solid #f1f5f9;padding:2px 0}
.mf-toc__item:last-child{border-bottom:none}
.mf-toc__item--highlight .mf-toc__link{color:#90ad25;font-weight:600}
.mf-toc__link{display:flex;align-items:center;justify-content:space-between;padding:6px 0;text-decoration:none;color:#374151;font-size:14px;transition:color .2s}
.mf-toc__link:hover{color:#90ad25}
.mf-toc__arrow{color:#90ad25;font-size:16px;flex-shrink:0}
.mf-toc__footer{padding-top:10px;border-top:1px solid #f1f5f9;margin-top:6px}
.mf-toc__meta{font-size:12px;color:#94a3b8}
.mf-faq{margin:32px 0}
.mf-faq__headline{font-size:22px;font-weight:700;color:#1e293b;margin-bottom:16px}
.mf-faq__item{border:1px solid #e5e7eb;border-radius:8px;margin-bottom:8px;overflow:hidden}
.mf-faq__question{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;cursor:pointer;background:#fff;user-select:none}
.mf-faq__q-text{font-weight:600;font-size:15px;color:#1e293b;flex:1;padding-right:12px}
.mf-faq__icon{width:20px;height:20px;position:relative;flex-shrink:0}
.mf-faq__icon::before,.mf-faq__icon::after{content:'';position:absolute;background:#90ad25;border-radius:2px;transition:transform .25s}
.mf-faq__icon::before{width:14px;height:2px;top:9px;left:3px}
.mf-faq__icon::after{width:2px;height:14px;top:3px;left:9px}
.mf-faq__item.open .mf-faq__icon::after{transform:rotate(90deg)}
.mf-faq__answer{display:none;padding:0 18px 16px;background:#fafafa}
.mf-faq__item.open .mf-faq__answer{display:block}
.mf-faq__a-inner{font-size:14px;color:#4b5563;line-height:1.6}
.mf-expert{border-radius:10px;overflow:hidden;margin:32px 0;border:1px solid #e5e7eb}
.mf-expert__inner{display:flex}
.mf-expert__sidebar{background:#90ad25;padding:24px 16px;display:flex;flex-direction:column;align-items:center;gap:10px;min-width:110px}
.mf-expert__avatar{width:56px;height:56px;border-radius:50%;background:#fff;color:#90ad25;font-size:20px;font-weight:800;display:flex;align-items:center;justify-content:center}
.mf-expert__badge{font-size:11px;font-weight:700;text-align:center;text-transform:uppercase;letter-spacing:.05em;color:#fff;opacity:.9}
.mf-expert__body{background:#fff;padding:24px;flex:1}
.mf-expert__label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#90ad25;display:block;margin-bottom:6px}
.mf-expert__name{font-size:17px;font-weight:700;color:#1e293b;margin:0 0 2px}
.mf-expert__title{font-size:13px;color:#64748b;margin:0 0 12px}
.mf-expert__divider{height:1px;background:#f1f5f9;margin-bottom:12px}
.mf-expert__quote{font-size:14px;color:#374151;line-height:1.65;margin:0;font-style:italic}
.mf-expert__quote-mark{font-size:24px;color:#90ad25;line-height:1;vertical-align:middle;margin-right:2px}
@media(max-width:600px){.mf-expert__inner{flex-direction:column}.mf-expert__sidebar{flex-direction:row;gap:14px;min-width:unset}}
`.trim();
