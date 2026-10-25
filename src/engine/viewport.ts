/*
  The page and the phone: lifting the game above the on-screen keyboard where the browser doesn't (fullscreen on
  Android), and no zooming in (on an iPhone a triple tap zoomed in, with no way back out).
*/

const app = document.getElementById('app') as HTMLElement;
const vv = window.visualViewport;
/** Android's autofill bar over the keyboard, in CSS pixels (about 48, plus some room). */
const AUTOFILL_BAR = 60;

const typing = () => {
  const f = document.activeElement;
  return f instanceof HTMLInputElement || f instanceof HTMLTextAreaElement ? f : null;
};

/** If the keyboard covers the answer box, lift the game just enough to show it (outside fullscreen the browser does). */
function liftAboveKeyboard() {
  app.style.transform = '';
  const field = typing();
  if (!vv || !field) return;
  // In fullscreen, Android's autofill bar (passwords, cards...) sits on the keyboard but isn't counted in its height:
  // keep clear of it too.
  const gap = document.fullscreenElement ? AUTOFILL_BAR + 12 : 12;
  const letters = document.querySelector('.accents'); // the Spanish letters under the answer box
  const bottom = Math.max(field.getBoundingClientRect().bottom, letters?.getBoundingClientRect().bottom ?? 0);
  const below = bottom + gap - (vv.offsetTop + vv.height);
  if (below > 0) app.style.transform = `translateY(${-below}px)`;
}

/** Safari fits the page again when the viewport tag changes: switch initial-scale between 1 and 1.0. */
function resetZoom() {
  const meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
  if (!meta) return;
  const c = meta.content;
  meta.content = c.includes('initial-scale=1.0') ? c.replace('initial-scale=1.0', 'initial-scale=1') : c.replace('initial-scale=1', 'initial-scale=1.0');
}

export function initViewport() {
  vv?.addEventListener('resize', liftAboveKeyboard);
  vv?.addEventListener('scroll', liftAboveKeyboard);
  document.addEventListener('focusin', () => setTimeout(liftAboveKeyboard, 300));
  document.addEventListener('focusout', () => setTimeout(liftAboveKeyboard, 100));

  // No zooming. iPhones ignore user-scalable=no, but these stop the gestures (style.css stops double taps).
  for (const ev of ['gesturestart', 'gesturechange', 'dblclick']) document.addEventListener(ev, (e) => e.preventDefault(), { passive: false });
  // If it zoomed in anyway, snap back (not while typing: the keyboard's own zoom settles by itself).
  vv?.addEventListener('resize', () => {
    if (vv.scale > 1.01 && !typing()) setTimeout(resetZoom, 300);
  });
}
