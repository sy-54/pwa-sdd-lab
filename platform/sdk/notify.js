// @ts-check
// 通知。OS 通知を出せるときは出し、出せないときはトーストで代替する。
import { toast } from './ui.js';

/**
 * どの手段で知らせるかを決める（純粋関数）。
 * @param {NotificationPermission} permission
 * @param {boolean} supported Notification と Service Worker が使えるか
 * @returns {'os' | 'ask' | 'toast'}
 */
export function channel(permission, supported) {
  if (!supported || permission === 'denied') return 'toast';
  return permission === 'granted' ? 'os' : 'ask';
}

/** @template T @param {Promise<T>} p @param {number} ms @returns {Promise<T>} */
const within = (p, ms) => Promise.race([p, new Promise((_, ng) => setTimeout(() => ng(new Error('timeout')), ms))]);

/**
 * OS 通知を出す。初回は許可を求める。拒否・未対応・失敗のときはトーストで代替する（例外は投げない）。
 * アプリを開いている間だけ使える。時刻指定や、閉じている間の通知はできない。
 * ボタンを押したときの処理から呼ぶこと（許可ダイアログはユーザー操作の中でしか出せない）。
 * @param {string} title
 * @param {string} [body]
 * @returns {Promise<'os' | 'toast'>} 実際に使った手段
 */
export async function send(title, body = '') {
  const supported = 'Notification' in globalThis && 'serviceWorker' in navigator;
  try {
    let ch = channel(supported ? Notification.permission : 'denied', supported);
    if (ch === 'ask') ch = channel(await Notification.requestPermission(), true);
    if (ch === 'os') {
      const reg = await within(navigator.serviceWorker.ready, 2000);
      await reg.showNotification(title, { body });
      return 'os';
    }
  } catch {
    // 下のトーストへ
  }
  toast(body ? `${title}：${body}` : title);
  return 'toast';
}

export const notify = { send };
