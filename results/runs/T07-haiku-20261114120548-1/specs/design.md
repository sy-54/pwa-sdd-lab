# 単語帳 設計

> モジュールはロジック（カード管理、学習キュー）と UI（画面遷移、DOM操作）に分離。
> カード情報は `storage` に JSON で保存。セッション状態は変数に保持（再起動でリセット）。
> 以下の機能を単体テストで、UI との連携を E2E で検証する。

## モジュール構成

| ファイル | 責務 |
|---|---|
| `main.js` | UI ロジック、イベントハンドラ、storage 連携 |
| `logic.js` | カード追加・削除、学習キュー操作（純粋関数） |

## データモデル

**保存キー：`'cards'`**
```javascript
[
  { front: 'apple', back: 'りんご' },
  { front: 'banana', back: 'バナナ' }
]
```
形式：オブジェクト配列。`front` と `back` は必須の文字列。

壊れた値の扱い：読込時に配列かつ全要素が `{ front: string, back: string }` の形をチェック。不正なら空配列で初期化。

セッション状態（保存しない）：
- `queue`（現在のキュー）：カード番号の配列
- `knownIndexes`（初見で覚えたカード番号）：集合
- `state`（画面）：`'list'`、`'study'`、`'result'`

## 使用するSDK API

- `await storage.get('cards', [])`：カード読込
- `await storage.set('cards', 値)`：カード保存
- `ui.toast(文言)`：追加・削除時の通知（不要なら省略）

## ACとテストの対応

| AC | 単体テスト | E2E | 確認方法 |
|---|---|---|---|
| AC-01：カード追加 | ― | ✓ | 入力→追加ボタン→表示確認 |
| AC-02：カード削除 | ― | ✓ | 削除ボタン→カード消失確認 |
| AC-03：永続保存 | ― | ✓ | 閉じる・開き直す→カード残存確認 |
| AC-04：表示 | `canDisplayFront` | ✓ | 学習開始→表表示確認 |
| AC-05：めくる | `getCardBack` | ✓ | flip ボタン→裏表示確認 |
| AC-06：「覚えた」 | `markAsKnown` | ✓ | know ボタン→次カード・進捗更新確認 |
| AC-07：「まだ」 | `moveToBack` | ✓ | again ボタン→キュー後ろ・次カード確認 |
| AC-08：再出現 | `moveToBack` 複数回 | ✓ | 全見た後の再出現確認 |
| AC-09：1回で覚えた | `countKnownOnce` | ✓ | 結果表示で計数確認 |
| AC-10：終了判定 | `isSessionFinished` | ✓ | 全知→結果画面確認 |
| AC-11：戻る | ― | ✓ | finish ボタン→一覧画面確認 |
| AC-12：0枚で開始 | ― | ✓ | 学習開始ボタン無効または何も起きない |
| AC-13：セッションリセット | ― | ✓ | 再起動後→progress 0 から開始確認 |

## 実装ノート

- `logic.js` の関数：`moveToBack(queue, index)`、`markAsKnown(knownSet, index)`、`countKnownOnce(cards, knownSet)` など
- `main.js` は `logic` の結果を DOM に反映し、`storage` で永続化
- CSS はすべて SDK（`sdk.css`）に依存。カスタムスタイルは不要
