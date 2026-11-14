# 改善ループの手順

> この文書だけを読んで「課題を追加する → 実行する → 失敗を分類する → 直す」を1周回せるようにしてある。
> 目的は、安価なモデル（Sonnet / Haiku）が軽量SDD（`sdd/`）で正しいアプリを作れる割合を上げること。
> 直す対象は `sdd/`・SDK・課題の検証であって、個々の実行結果ではない。

## 0. 前提
- 作業場所はリポジトリのルート。Node 22、`claude` CLI（ログイン済み）が必要。初回だけ `npm ci && npx playwright install webkit`。
- 用語：**実行モデル**＝課題を解くモデル。**隠しファイル**＝`tasks/*/stakeholder.md` と `tasks/*/acceptance/`（実行モデルには見せない）。
- 1回の実行は6フェーズ（spec-questions → spec → design → tasks → impl → e2e → feedback）。目安は Sonnet で 6〜10分・$1.5〜3、Haiku で 5〜8分・$0.5〜1。
- **利用上限がある。** 定額プランでは5時間枠あたり、おおよそ 8 実行（Sonnet 4＋Haiku 4 程度）で上限に達する。1回のコマンドで流すのは 8 実行までにする。
- 上限に達すると、ランナーはその実行を無効（`result.json` の `invalid`）として記録し、残りを中断する。無効な実行は集計に入らない。上限が戻る時刻（ログに表示される）を待って、同じコマンドを再実行する。

## 1. 課題を追加する
`tasks/T<番号>-<名前>/` に次の4つを置く。既存の課題（`tasks/T02-todo/` が手頃）をコピーして書き換えるのが早い。

| ファイル | 役割 | 要点 |
|---|---|---|
| `requirements.md` | 実行モデルに渡す要求 | 40行以内。`npm run lint:sdd -- tasks/<課題> --phase requirements` を通す |
| `stakeholder.md` | 要求者の本当の意図（隠し） | 要求に書かなかった決めごとを箇条書きで。「どちらでもよい」も明記する |
| `acceptance/*.spec.ts` | 採点用E2E（隠し） | UI契約の `data-testid` だけを使う |
| `task.json` | `{ "platform": true }` で SDK を同梱 | 既存コードへの改修課題は `seed/` に土台を置く（`tasks/T06-counter-change/` 参照） |

**requirements.md の書き方**
- UI契約に、エントリのパス（`apps/<id>/index.html`）と `apps/<id>/manifest.json`（省略せずフルパスで。lint が実在を検査する）、隠しE2E が使う `data-testid`・表示形式をすべて書く。ここに書いていない testid や文言を隠しE2E で使ってはいけない。
- 曖昧さを2〜4個、わざと残す（初期値、並び順、空入力、削除の確認、境界値、日付の変わり目など）。答えは `stakeholder.md` に書く。
- 曖昧さは「聞けば分かる」ものに限る。聞いても分からないこと、常識で決まらない文言の一致は採点しない。

**acceptance の書き方**
- 要求と UI契約から決まることを確かめるテストと、`stakeholder.md` を聞かないと決まらないことを確かめるテストを分ける。後者はテスト名を `[意図]` で始める。
- 実装の違いを許す：押せない実装と押しても無視する実装の両方を通す（`click({ force: true, timeout: 1000 }).catch(() => {})`）。並び順を問わないテストでは `sort()` して比べる。
- 保存の直後に再読み込みするときは `await page.waitForTimeout(300)` を挟む（保存は非同期）。
- 時間・日付は `page.clock.install({ time })` → `page.clock.runFor(ms)` / `fastForward(ms)`。再読み込みしても偽の時計は続く。
- 写真は `acceptance/helpers.ts` の `png(幅, 高さ)` で作り、`filechooser` で渡す（`tasks/T03-photo-memo/` 参照）。

**課題を信用する前に必ず確かめる**：新しい課題はまず Sonnet で1回だけ実行する（手順2）。落ちたテストを1つずつ見て、テスト側の誤りでないかを確かめる（手順4の「検証」）。隠しE2E が正しいと確かめられるまで、その課題の結果を集計の根拠にしない。

## 2. 実行する
```
npm run harness -- --tasks T09 --models sonnet                         # 新しい課題の確認（1回）
npm run harness -- --tasks T01,T02 --models sonnet,haiku --runs 2 --parallel 4
npm run summary                                                        # results/summary.md を再生成
npm run regrade -- T01                                                 # 隠しE2E を直した後、既存の実行を採点し直す（再実行は不要）
```
- 作業ディレクトリはリポジトリの外（`$TMPDIR/sdd-runs/<実行ID>/`）に作られる。隠しファイルを実行モデルから離すため。
- 結果は `results/runs/<実行ID>/` に入る：`result.json`（採点）、`specs/`（書かれた文書）、`work/`（成果物一式）、`logs/`（各フェーズの全ログ。`*.jsonl`）。
- 実行中に `sdd/` や `harness/template/` を変えない（開始済みの実行と条件がずれる）。
- 出力に「無効」「中断」が出たら、その実行は採点されていない。モデルの失敗として分類しない。

## 3. 結果を読む
`results/summary.md` の「実行一覧」で、落ちたテスト名・未通過ゲート・手戻りを見る。詳しくは `result.json`：

| 項目 | 意味 | 見るところ |
|---|---|---|
| `acceptance.failed` | 落ちた隠しE2E の名前 | `[意図]` 付きか否かで原因の当たりが変わる |
| `gatesFailed` | 3回やり直しても通らなかったフェーズ | `phases[].lastError` に最後のエラー |
| `rework` | ゲートでのやり直し回数の合計 | 多いフェーズの手順書が分かりにくい可能性 |
| `ownTests` | モデル自身の単体・E2E が通ったか | 自分のテストは通るのに隠しE2E が落ちる＝仕様の取り違え |
| `qaRounds` / `specs/qa.md` | 壁打ちの質問と回答 | 聞くべきことを聞いたか、回答が spec に反映されたか |
| `leaked` | 隠しファイルを読んだ形跡 | true の実行は無効として除く |

落ちたテストの原因を確かめる手順（上から順に。途中で分かったら止める）：
1. `tasks/<課題>/acceptance/` の該当テストを読み、何を期待しているかを確かめる。
2. `results/runs/<ID>/specs/qa.md` と `spec.md` を読む。期待される挙動が spec に書かれているか。
3. `results/runs/<ID>/work/apps/` の実装を読む。spec どおりに作られているか。
4. 再現する：`ACCEPT_DIR=$PWD/tasks/<課題>/acceptance WORK_DIR=$PWD/results/runs/<ID>/work ACCEPT_OUT=/tmp/out PORT=4599 npx playwright test -c harness/grade/acceptance.config.ts --reporter=line`

## 4. 失敗を分類する
1つの失敗につき、次の4つから**1つだけ**選ぶ。迷ったら上から順に当てはめる。

| 分類 | 判断の基準 | 直す場所 |
|---|---|---|
| **検証** | テストや課題の側が悪い。UI契約にない testid・文言・形式を期待している／要求とも意図とも読める挙動を片方に決め打ちしている／待ちが足りずタイミングで落ちる／`stakeholder.md` に答えが書かれていない | `tasks/<課題>/`（requirements の UI契約、stakeholder、acceptance）、`harness/` |
| **スキル** | 手順書に従えば防げた、または手順書に書いていないので防げなかった。聞くべき質問をしていない／回答が spec に反映されていない／spec にあるのに AC・タスク・テストに落ちていない／lint が通るのに文書の中身が空疎。**複数の課題・複数の実行で同じ型の失敗が出る** | `sdd/phases/*.md`、`sdd/templates/`、`harness/lint/`、`harness/template/WORKSPACE.md` |
| **SDK API** | SDK の使い方を間違えた、SDK にあるのに自作した、SDK の制約を知らなかった、API が使いにくく誤用を誘う | `platform/sdk/README.md`（説明不足）、`platform/sdk/*.js`（API の形。変えたら `npm run check:platform`） |
| **モデルの限界** | spec・design は正しく、手順書にも書いてあるのに、実装を誤る。同じ課題を再実行すると通ることがある。Sonnet では出ず Haiku だけで出る | 直さない。`results/improvements.md` に記録だけする。3回続けて出るなら「スキル」として手順を細かくできないか考える |

**実例（11/14 の1周目、課題 T01）**
- 検証：`fill` の直後にボタンを押すテストで、実装によってはクリックが届かなかった。モデル自身の E2E は通っていた → テストを「入力を確定（`blur()`）してから押す」に直し、`regrade` で 3/9 → 7/9。**自分のテストは通るのに隠しE2E の基本的なテストが落ちるときは、まずテスト側を疑う。**
- 検証：要求者シミュレータが「B。ただし…」と、選んだ選択肢と違う内容を答えた → `harness/stakeholder/prompt.md` を直した。**qa.md の回答が `stakeholder.md` と食い違っていたら、モデルではなくシミュレータの問題。**
- スキル：Sonnet が2回とも「時間になったらどう知らせるか」を聞かず、SDK の通知を使わなかった → 01-spec に「質問の前に SDK の README を読む」「手段が複数ある要求は聞く」を追加。
- モデルの限界：Haiku が import した関数と同じ名前の関数を宣言し、画面が動かなくなった。記録のみ。

- `[意図]` のテストだけが落ち、qa.md にその質問がない → まず**スキル**（01-spec の質問の洗い出し）を疑う。ただし、普通は聞かないような細部なら**検証**（その曖昧さは採点に向かない。UI契約に書くか、テストを外す）。
- 1つの実行だけの失敗で `sdd/` を直さない。**同じ型が2回以上**出てから直す。

## 5. 直す
- 変更は1つの原因につき1つ。小さく直す。
- `sdd/` に**課題固有の答えを書かない**（「ToDo は下に追加する」などは禁止）。書いてよいのは、どの課題にも当てはまる進め方だけ（「並び順は必ず質問する」など）。
- 手順書は短く保つ。1行足すなら、効いていない1行を消せないか考える。行が増えるほど Haiku は読み落とす。
- 直したら `results/improvements.md` に1行追加する：`日付 [分類] 何を変えたか ← きっかけ（実行ID・課題）`。
- `sdd/` と `harness/` を直したら `npm test`、`platform/` を直したら `npm run check:platform` を通す。

## 6. 効果を確かめる
- 失敗した課題×モデルを2回ずつ再実行する。あわせて、前に通っていた課題を1つ再実行する（別の課題を壊していないかの確認）。
- `npm run summary` で前後を比べる。良くなっていなければ変更を戻す（`git revert`）。戻したことも `improvements.md` に書く。
- コミットする：`git add -A && git commit -m "改善: <要約>"`。`results/runs/*/work` と `logs` は git に入らない（`.gitignore`）。

## 7. やってはいけないこと
- 隠しファイルの内容を、`requirements.md`、`sdd/`、`harness/template/`、SDK の README に書くこと。
- 通過率を上げるために隠しE2E を弱めること（「検証」の基準に当てはまるときだけ直す）。
- 人間（Shigeru）の承認が要るもの（platform の spec・design・改訂履歴、公開設定の変更）を承認なしで進めること。
- `git push --force`、`results/runs/` の削除。

## 8. 1周のチェックリスト
- [ ] 課題を追加し、requirements の lint を通した
- [ ] Sonnet で1回実行し、落ちたテストがテスト側の誤りでないことを確かめた
- [ ] 対象の課題×モデルを2回ずつ実行した
- [ ] 失敗を1つずつ分類し、`results/improvements.md` に書いた
- [ ] 同じ型が2回以上出たものを直し、再実行で確かめた
- [ ] `npm test` と `npm run summary` を実行し、コミットした
