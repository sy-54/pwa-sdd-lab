// @ts-check
// UI部品：トースト、確認ダイアログ、ヘッダー。見た目は sdk.css。

/** sdk.css を1度だけ読み込む。 */
export function ensureStyle() {
  if (document.querySelector('link[data-sdk-style]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('./sdk.css', import.meta.url).href;
  link.dataset.sdkStyle = '';
  document.head.append(link);
}

/** @param {string} tag @param {Record<string, string>} attrs @param {(Node | string)[]} children */
function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  e.append(...children);
  return e;
}

/** @type {ReturnType<typeof setTimeout> | undefined} */
let toastTimer;

/**
 * 画面下に短いメッセージを出す。3秒で消える。同時に出るのは1つだけ（新しいものが置き換える）。
 * @param {string} message
 * @param {{ duration?: number }} [options]
 */
export function toast(message, { duration = 3000 } = {}) {
  ensureStyle();
  document.querySelector('[data-testid="sdk-toast"]')?.remove();
  clearTimeout(toastTimer);
  const t = el('div', { class: 'sdk-toast', 'data-testid': 'sdk-toast', role: 'status' }, String(message));
  document.body.append(t);
  toastTimer = setTimeout(() => t.remove(), duration);
}

/**
 * 確認ダイアログ。OK なら true、キャンセルなら false。window.confirm の代わりに使う。
 * @param {string} message
 * @param {{ ok?: string, cancel?: string }} [options]
 * @returns {Promise<boolean>}
 */
export function confirm(message, { ok = 'OK', cancel = 'キャンセル' } = {}) {
  ensureStyle();
  return new Promise((resolve) => {
    const okBtn = el('button', { 'data-testid': 'sdk-confirm-ok', type: 'button' }, ok);
    const cancelBtn = el('button', { 'data-testid': 'sdk-confirm-cancel', type: 'button', class: 'secondary' }, cancel);
    const overlay = el(
      'div',
      { class: 'sdk-overlay', 'data-testid': 'sdk-confirm' },
      el('div', { class: 'sdk-dialog', role: 'alertdialog', 'aria-modal': 'true' }, el('p', {}, String(message)), el('div', { class: 'row' }, cancelBtn, okBtn)),
    );
    const done = (/** @type {boolean} */ v) => {
      overlay.remove();
      resolve(v);
    };
    okBtn.onclick = () => done(true);
    cancelBtn.onclick = () => done(false);
    document.body.append(overlay);
    okBtn.focus();
  });
}

/** ヘッダー（アプリ名とホームへ戻るリンク）を body の先頭に入れる。 @param {string} title @param {string} homeUrl */
export function header(title, homeUrl) {
  ensureStyle();
  if (document.querySelector('[data-testid="sdk-header"]')) return;
  document.body.prepend(
    el('header', { class: 'sdk-header', 'data-testid': 'sdk-header' }, el('a', { href: homeUrl, 'data-testid': 'sdk-home', 'aria-label': 'ホームへ戻る' }, '‹ ホーム'), el('h1', {}, title)),
  );
}

export const ui = { toast, confirm };
