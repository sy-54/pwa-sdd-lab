// ミニアプリの manifest.json を検証する純粋関数。エラー文の配列を返す（空なら合格）。
export interface AppManifest {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

const graphemes = (s: string) => [...new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(s)].length;

/** @param indexHtml index.html の内容。ファイルがなければ null */
export function validateManifest(json: unknown, folder: string, indexHtml: string | null): string[] {
  const errs: string[] = [];
  if (typeof json !== 'object' || json === null || Array.isArray(json)) return ['manifest.json はオブジェクトにする'];
  const m = json as Record<string, unknown>;
  if (typeof m.id !== 'string' || !/^[a-z0-9-]+$/.test(m.id)) errs.push('id は英小文字・数字・ハイフンのみの文字列にする');
  else if (m.id !== folder) errs.push(`id（${m.id}）はフォルダ名（${folder}）と同じにする`);
  if (typeof m.name !== 'string' || graphemes(m.name) < 1 || graphemes(m.name) > 20) errs.push('name は1〜20文字の文字列にする');
  if (typeof m.icon !== 'string' || graphemes(m.icon) !== 1) errs.push('icon は絵文字1つにする');
  if (m.description !== undefined && typeof m.description !== 'string') errs.push('description は文字列にする');
  if (indexHtml === null) errs.push('index.html がない');
  else if (!indexHtml.includes('data-testid="app-root"')) errs.push('index.html に data-testid="app-root" がない');
  return errs;
}
