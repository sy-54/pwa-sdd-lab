// @ts-check
// カメラ。iOS で確実に動く input[type=file][capture] を使い、canvas で縮小した JPEG を返す。

/**
 * 長辺が max 以下になる大きさを返す（純粋関数）。拡大はしない。
 * @param {number} width @param {number} height @param {number} max
 */
export function fitSize(width, height, max) {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/** @param {Blob} file @returns {Promise<HTMLImageElement>} */
function load(file) {
  return new Promise((ok, ng) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => (URL.revokeObjectURL(url), ok(img));
    img.onerror = () => (URL.revokeObjectURL(url), ng(new Error('画像を読み込めませんでした')));
    img.src = url;
  });
}

/**
 * 画像ファイルを長辺 maxSize 以下の JPEG にする。画像でなければ例外。
 * @param {Blob} file @param {number} maxSize @param {number} quality
 * @returns {Promise<Blob>}
 */
export async function resize(file, maxSize, quality) {
  const img = await load(file);
  const { width, height } = fitSize(img.naturalWidth, img.naturalHeight, maxSize);
  const canvas = Object.assign(document.createElement('canvas'), { width, height });
  canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
  return new Promise((ok, ng) => canvas.toBlob((b) => (b ? ok(b) : ng(new Error('画像を変換できませんでした'))), 'image/jpeg', quality));
}

/**
 * カメラ（または写真の選択）を開き、縮小した JPEG を返す。キャンセルしたら null。
 * 画像でないファイルが選ばれたときは例外を投げる。ボタンを押したときの処理から呼ぶこと。
 * @param {{ maxSize?: number, quality?: number }} [options] maxSize は長辺の上限（既定 1280px）
 * @returns {Promise<Blob | null>}
 */
export function takePhoto({ maxSize = 1280, quality = 0.85 } = {}) {
  return new Promise((ok, ng) => {
    document.querySelector('[data-testid="sdk-camera-input"]')?.remove();
    const input = document.createElement('input');
    Object.assign(input, { type: 'file', accept: 'image/*', hidden: true });
    input.setAttribute('capture', 'environment');
    input.dataset.testid = 'sdk-camera-input';
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      input.remove();
      if (!file) return ok(null);
      resize(file, maxSize, quality).then(ok, ng);
    });
    input.addEventListener('cancel', () => (input.remove(), ok(null)));
    document.body.append(input);
    input.click();
  });
}

export const camera = { takePhoto };
