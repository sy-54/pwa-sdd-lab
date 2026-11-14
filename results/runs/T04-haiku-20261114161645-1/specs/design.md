# 習慣トラッカー 設計

> 習慣データを配列で管理し、DOM 操作と分離したロジックで連続日数を計算
> storage.set で毎回保存。SDK の ui.confirm で削除確認表示
> 未チェック習慣をソート時に上部に配置

## モジュール構成

- `main.js`：初期化、イベントハンドリング、DOM 更新、storage への save 呼び出し
- `logic.js`：習慣追加・削除・更新、ソート、連続日数計算（日付ベース）

## データモデル

storage キー：`"habits"`

```json
{
  "idCounter": 1,
  "habits": [
    {
      "id": 1,
      "name": "運動",
      "addedDate": "2026-11-15",
      "lastCheckedDate": "2026-11-15",
      "isCheckedToday": true,
      "streak": 1
    }
  ]
}
```

**破損時：** 値が オブジェクトでない、`habits` が配列でない、必須フィールド欠け → 既定値 `{ idCounter: 0, habits: [] }` から開始

## 使用するSDK API

- `storage.get("habits", 既定値)`
- `storage.set("habits", value)`
- `ui.confirm(文言, { ok, cancel })`

## ACとテストの対応

| AC | 単体テスト | E2E |
|---|---|---|
| AC-01 追加 | `addHabit()` 戻り値 | ✓ |
| AC-02 チェック保存 | `updateChecked()` 後に format | ✓ |
| AC-03 連続日数表示 | `calculateStreak()` の戻り値 | ✓ |
| AC-04 前日から継続 | 日付差分で確認 | ✓ |
| AC-05 外すと0 | `updateChecked(false)` で streak=0 | ✓ |
| AC-06 未チェック上部 | `sortHabits()` で分離 | ✓ |
| AC-07 削除 | UI 側で confirm 後 | ✓ |
| AC-08 空文字列許可しない | `addHabit()` バリデーション | ✓ |
| AC-09 同名複数許可しない | `addHabit()` 重複チェック | ✓ |
| AC-10 復元 | `storage.get()` → format | ✓ |

## 重要な実装ポイント

- **連続日数計算：** 表示のたびに「今日」の日付から計算。前日チェック済み且つ連続 → +1、前日未チェック → 1、未チェック → 0
- **日付判定：** `new Date().toISOString().split('T')[0]` で YYYY-MM-DD を取得
- **ソート：** isCheckedToday=false を前に、同じ状態内では addedDate の昇順
- 削除時確認は `ui.confirm()` を使う（`window.confirm` ではない）
