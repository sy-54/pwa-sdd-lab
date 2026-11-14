# 支出メモ 設計

> ロジック（金額検証、月フィルタ、合計計算、表示整形）は `logic.js` に純粋関数としてまとめ、`main.js` は DOM 操作と SDK 呼び出しだけを行う。
> 記録は `storage` のキー `records` に配列で1本保存し、画面を開くたびに「今月分」を現在時刻から再計算する。
> 配列として読めない保存データは空配列として扱う。

## モジュール構成
- `apps/expense/index.html`：画面の骨組み（入力行・一覧・合計欄）
- `apps/expense/main.js`：`storage`/`ui` 呼び出し、DOM 更新、イベント結線
- `apps/expense/logic.js`：金額検証、今月分の絞り込み・並び替え、合計・分類別合計の計算、カンマ区切り整形、保存データの正規化
- `apps/expense/manifest.json`：アプリ情報

## データモデル
- キー `records`：`{ id: string, amount: number, category: 'food'|'daily'|'transport'|'other', createdAt: string(ISO) }[]`
  - 例：`[{ "id": "b3f1c2d4-5678-4abc-9def-0123456789ab", "amount": 500, "category": "transport", "createdAt": "2026-11-15T03:00:00.000Z" }]`
  - `id` は `crypto.randomUUID()` で生成
  - `createdAt` は記録時のローカル日時を `Date` で生成し ISO 文字列化（並び替え・月判定に使う。月判定は `new Date(createdAt)` のローカルの年月で行う）
  - 配列として読めない（`Array.isArray` が false）場合は `[]` として扱う。要素が壊れている（`amount` が正の整数でない、`category` が4値以外）場合はその要素を除外する

## 使用するSDK API
- `mountApp`：起動時のヘッダー・共通スタイル適用
- `storage.get` / `storage.set`：`records` の読み書き
- `ui.toast`：不正な金額入力時のエラー通知
- `ui.confirm`：削除前の確認

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | `logic.test.js`: 追加後の配列に新規記録が先頭に入る | `expense.spec.ts` |
| AC-02 | `logic.test.js`: `sumTotal` が今月分の合計を返す | `expense.spec.ts` |
| AC-03 | `logic.test.js`: `formatAmount(12000)` が `"12,000"` | `expense.spec.ts` |
| AC-04 | `logic.test.js`: 配列から該当 `id` を除去する | `expense.spec.ts` |
| AC-05 | ― | `expense.spec.ts`（`sdk-confirm-cancel` で状態不変） |
| AC-06 | `logic.test.js`: `validateAmount` が空／`0`／負／非数字／小数で不正を返す | `expense.spec.ts` |
| AC-07 | `logic.test.js`: `filterThisMonth`＋並び替えが先月分を除外し新しい順にする | `expense.spec.ts` |
| AC-08 | ― | `expense.spec.ts`（再読み込み後も表示が同じ） |
| AC-09 | `logic.test.js`: 前月のみの配列で `filterThisMonth` が空になる | `expense.spec.ts` |
| AC-10 | `logic.test.js`: `sumByCategory` が分類ごとの合計を返す（0件は`0`） | `expense.spec.ts` |
