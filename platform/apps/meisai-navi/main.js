// @ts-check
// 画面。描画、イベント、保存の呼び出しだけを行う。計算は csv / classify / model / tips / format に置く。
import { mountApp, storage, ui } from '../../sdk/sdk.js';
import { decodeText, readStatement } from './csv.js';
import { monthLabel, share, yen } from './format.js';
import { addCategory, deleteCategory, initialState, monthsOf, putFile, removeFile, renameCategory, repairState, resolveRows, setRule, summarize } from './model.js';
import { buildTips } from './tips.js';

mountApp({ title: '明細節約ナビ' });

/** @type {import('./model.js').State} */
let state = repairState(await storage.get('state', null));
/** 保存しない表示の状態 */
const view = { tab: 'home', month: 'all', query: '', filter: '', limit: 150 };
const PAGE = 150;

const $ = (/** @type {string} */ id) => /** @type {HTMLElement} */ (document.getElementById(id));
const byTestId = (/** @type {string} */ id) => /** @type {HTMLElement} */ (document.querySelector(`[data-testid="${id}"]`));
const esc = (/** @type {unknown} */ s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const REASON = { empty: '費目名を入力してください', duplicate: '同じ名前の費目があります', limit: '費目は12個までです', missing: 'その費目はもうありません', other: '「その他」は削除できません' };

async function save() {
  try {
    await storage.set('state', state);
  } catch {
    ui.toast('保存できませんでした');
  }
}
/** 状態を置き換え、保存して描き直す。 @param {import('./model.js').State} next */
function commit(next) {
  state = next;
  render();
  return save();
}

function render() {
  const all = resolveRows(state);
  const months = monthsOf(all);
  if (view.month !== 'all' && !months.includes(view.month)) view.month = 'all';
  const rows = view.month === 'all' ? all : all.filter((r) => r.ym === view.month);
  const empty = all.length === 0;
  const onData = view.tab === 'data';

  $('months').hidden = onData || empty;
  byTestId('empty-guide').hidden = onData || !empty;
  for (const t of ['home', 'tips', 'list', 'data']) $(`view-${t}`).hidden = view.tab !== t || (empty && t !== 'data');
  for (const b of document.querySelectorAll('.tabs button')) {
    if (/** @type {HTMLElement} */ (b).dataset.tab === view.tab) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  }

  const manyYears = new Set(months.map((m) => m.slice(0, 4))).size > 1;
  $('months').innerHTML = [['all', '全期間'], ...months.slice().reverse().map((m) => [m, manyYears ? m.replace('-', '/') : monthLabel(m)])]
    .map(([m, label]) => `<button data-testid="month-chip" data-month="${m}" aria-pressed="${view.month === m}">${label}</button>`)
    .join('');

  if (empty) {
    $('view-home').innerHTML = $('view-tips').innerHTML = $('tx-list').innerHTML = '';
  } else {
    renderHome(rows, all, months);
    renderTips(rows, all, months);
    renderList(rows);
  }
  renderData();
}

const dot = (/** @type {number} */ color) => `<span class="dot" style="background:var(--c${color})"></span>`;
const catOf = (/** @type {string} */ id) => state.cats.find((c) => c.id === id) ?? { id, name: 'その他', color: 8 };

/** @param {import('./model.js').ResolvedRow[]} rows @param {import('./model.js').ResolvedRow[]} all @param {string[]} months */
function renderHome(rows, all, months) {
  const s = summarize(rows, state.cats);
  const scopeMonths = view.month === 'all' ? months : [view.month];
  const days = scopeMonths.reduce((t, ym) => t + new Date(Number(ym.slice(0, 4)), Number(ym.slice(5)), 0).getDate(), 0) || 1;
  const scopeName = view.month === 'all' ? (months.length > 1 ? `${monthLabel(months[0], true)}〜${monthLabel(months[months.length - 1])}` : monthLabel(months[0], true)) : monthLabel(view.month, true);
  const max = Math.max(1, ...s.byCat.map((c) => c.total));
  const stacked = state.cats.map((c) => s.byCat.find((x) => x.id === c.id)).filter((c) => c && c.total > 0);
  const trend = summarize(all, state.cats).byMonth.slice(-6);
  const trendMax = Math.max(1, ...trend.map((m) => m.total));

  $('view-home').innerHTML = `
    <div class="card receipt">
      <div class="label"><span>ご利用合計</span><span>${esc(scopeName)}</span></div>
      <div class="total num"><small>¥</small><span data-testid="total">${yen(s.total)}</span></div>
      <dl>
        <div><dt>ご利用件数</dt><dd class="num"><span data-testid="count">${s.count}</span>件</dd></div>
        <div><dt>1日あたり</dt><dd class="num">¥${yen(s.total / days)}</dd></div>
        ${scopeMonths.length > 1 ? `<div><dt>月平均</dt><dd class="num">¥${yen(s.total / scopeMonths.length)}</dd></div>` : ''}
      </dl>
    </div>
    <div class="card">
      <h2>費目ごとの割合</h2>
      <div class="stack" aria-hidden="true">${stacked.map((c) => `<span style="flex:${c?.total} 0 0;background:var(--c${c?.color})"></span>`).join('')}</div>
      <div class="lines">${s.byCat.map((c) => `
        <button class="plain cat" data-testid="category-row" data-cat="${esc(c.id)}">
          <span class="sw" style="background:var(--c${c.color})"></span>
          <span class="name">${esc(c.name)}<small>${c.count}件</small></span>
          <span class="amount num">¥<span data-testid="category-amount">${yen(c.total)}</span><small data-testid="category-share">${share(c.total, s.total)}</small></span>
          <span class="bar"><i style="width:${Math.max(0, (c.total / max) * 100)}%;background:var(--c${c.color})"></i></span>
        </button>`).join('')}</div>
    </div>
    ${trend.length > 1 ? `
    <div class="card">
      <h2>月ごとの合計</h2>
      <div class="trend">${trend.map((m) => `
        <button class="plain num" data-month="${m.ym}" aria-pressed="${view.month === m.ym}" aria-label="${monthLabel(m.ym, true)} ${yen(m.total)}円">
          <span>${m.total >= 10000 ? (m.total / 10000).toFixed(1) + '万' : yen(m.total)}</span>
          <i style="height:${Math.max(0, (m.total / trendMax) * 70)}%"></i><span>${monthLabel(m.ym)}</span>
        </button>`).join('')}</div>
    </div>` : ''}
    <div class="card">
      <h2>よく使った店</h2>
      <div class="lines">${s.shops.map((x) => `<div class="between" data-testid="shop-row"><span>${esc(x.name)} <small class="muted">${x.count}回</small></span><span class="num">¥${yen(x.total)}</span></div>`).join('')}</div>
    </div>`;
}

const PILL = { crit: '要対応', warn: '見直し', info: '確認' };
/** @param {import('./model.js').ResolvedRow[]} rows @param {import('./model.js').ResolvedRow[]} all @param {string[]} months */
function renderTips(rows, all, months) {
  const tips = buildTips({ rows, allRows: all, month: view.month, months, cats: state.cats });
  const saving = tips.reduce((t, x) => t + x.saving, 0);
  $('view-tips').innerHTML = `
    <div class="card hero">
      <span class="small">節約できそうな金額の目安</span>
      <div class="big2 num">¥<span data-testid="tip-total">${yen(saving)}</span><small> /月</small></div>
      <p>年間では¥${yen(saving * 12)}。各項目に書いた仮定で計算した参考値です。</p>
    </div>
    ${tips.map((t) => `
    <div class="card tip" data-testid="tip" data-kind="${t.kind}" data-level="${t.level}">
      <div class="between"><h3>${esc(t.title)}</h3><span class="pill">${PILL[t.level]}</span></div>
      <p>${esc(t.body)}</p>
      ${t.list ? `<div class="sub">${t.list.map(([a, b]) => `<div class="between"><span>${esc(a)}</span><span class="num">${esc(b)}</span></div>`).join('')}</div>` : ''}
      ${t.saving > 0 ? `<div class="small">目安 ¥<b class="num" data-testid="tip-saving">${yen(t.saving)}</b> /月</div>` : ''}
    </div>`).join('') || '<p class="empty">目立った節約ポイントは見つかりませんでした。</p>'}`;
}

/** @param {import('./model.js').ResolvedRow[]} scoped */
function renderList(scoped) {
  if (view.filter && !state.cats.some((c) => c.id === view.filter)) view.filter = '';
  const select = /** @type {HTMLSelectElement} */ (byTestId('tx-filter'));
  select.innerHTML = '<option value="">すべての費目</option>' + state.cats.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
  select.value = view.filter;
  const search = /** @type {HTMLInputElement} */ (byTestId('tx-search'));
  if (search.value !== view.query) search.value = view.query;

  const q = view.query.normalize('NFKC').toUpperCase().replace(/\s/g, '');
  const rows = scoped.filter((r) => (!view.filter || r.cat === view.filter) && (!q || r.name.toUpperCase().replace(/\s/g, '').includes(q)));
  let html = '';
  let day = '';
  for (const r of rows.slice(0, view.limit)) {
    if (r.d !== day) {
      day = r.d;
      html += `<div class="day num">${r.d.replace(/-/g, '/')}</div>`;
    }
    const c = catOf(r.cat);
    html += `
      <button class="plain tx" data-testid="tx-row" data-key="${esc(r.key)}">
        <span class="n" data-testid="tx-name">${esc(r.name)}</span>
        <span class="a num">¥<span data-testid="tx-amount">${yen(r.a)}</span></span>
        <span class="c">${dot(c.color)}<span data-testid="tx-category">${esc(c.name)}</span>${state.rules[r.key] ? '<span>（修正済み）</span>' : ''}</span>
        <span class="e num">${r.f > 0 ? `手数料 ¥${yen(r.f)}` : ''}</span>
      </button>`;
  }
  $('tx-list').innerHTML = `
    <div class="card">
      <div class="between"><h2>${rows.length}件</h2><span class="muted small">合計 ¥${yen(rows.reduce((t, r) => t + r.a, 0))}・行を押すと費目を修正</span></div>
      <div>${html || '<p class="empty">条件に合う明細はありません</p>'}</div>
      ${rows.length > view.limit ? `<button class="secondary" id="more">さらに表示（残り${rows.length - view.limit}件）</button>` : ''}
    </div>`;
}

function renderData() {
  $('files').innerHTML = state.files.length
    ? state.files.map((f, i) => `
      <div class="between" data-testid="file-row">
        <span>${esc(f.name)}<br><small class="muted num">${f.rows.length}件・¥${yen(f.rows.reduce((t, r) => t + r.a, 0))}</small></span>
        <button class="secondary" data-testid="file-delete" data-index="${i}">削除</button>
      </div>`).join('')
    : '<p class="muted small">まだ読み込んでいません</p>';
  $('cats').innerHTML = state.cats.map((c) => `
    <div class="catrow">
      ${dot(c.color)}
      <input data-testid="category-edit" data-id="${esc(c.id)}" value="${esc(c.name)}" aria-label="費目名" autocomplete="off" maxlength="20" />
      ${c.id === 'other' ? '' : `<button class="secondary" data-testid="category-delete" data-id="${esc(c.id)}">削除</button>`}
    </div>`).join('');
}

/** @param {string} tab */
function go(tab) {
  view.tab = tab;
  view.limit = PAGE;
  render();
  window.scrollTo(0, 0);
}

function openSheet(/** @type {string} */ key) {
  const row = resolveRows(state).find((r) => r.key === key);
  if (!row) return;
  $('sheet-title').textContent = row.name;
  $('sheet').dataset.key = key;
  $('options').innerHTML = state.cats.map((c) => `<button data-testid="category-option" data-cat="${esc(c.id)}" aria-pressed="${row.cat === c.id}">${dot(c.color)}<span>${esc(c.name)}</span></button>`).join('');
  $('sheet').hidden = false;
}
const closeSheet = () => { $('sheet').hidden = true; };

document.addEventListener('click', async (e) => {
  const t = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest('button, .sheet-bg'));
  if (!t) return;
  const id = t.dataset.testid;
  if (t.dataset.tab) {
    if (t.dataset.tab === 'list') { view.filter = ''; view.query = ''; }
    go(t.dataset.tab);
  } else if (id === 'go-import') go('data');
  else if (t.dataset.month) {
    view.month = id !== 'month-chip' && view.month === t.dataset.month ? 'all' : t.dataset.month;
    view.limit = PAGE;
    render();
  } else if (id === 'category-row') {
    view.filter = t.dataset.cat ?? '';
    view.query = '';
    go('list');
  } else if (id === 'tx-row') openSheet(t.dataset.key ?? '');
  else if (id === 'category-option') {
    closeSheet();
    await commit(setRule(state, $('sheet').dataset.key ?? '', t.dataset.cat ?? ''));
  } else if (t.id === 'sheet-close' || (t.id === 'sheet' && e.target === t)) closeSheet();
  else if (t.id === 'more') { view.limit += PAGE * 2; render(); }
  else if (id === 'file-delete') await commit(removeFile(state, Number(t.dataset.index)));
  else if (id === 'clear-all') {
    if (!(await ui.confirm('読み込んだ明細と費目の修正をすべて消し、費目を最初の状態に戻します。', { ok: '消す' }))) return;
    byTestId('import-message').textContent = '';
    await commit(initialState());
  } else if (id === 'category-add') {
    const input = /** @type {HTMLInputElement} */ (byTestId('category-name'));
    const r = addCategory(state, input.value);
    if (!r.ok) return ui.toast(REASON[r.reason]);
    input.value = '';
    await commit(r.state);
  } else if (id === 'category-delete') {
    const c = catOf(t.dataset.id ?? '');
    if (!(await ui.confirm(`「${c.name}」を削除します。この費目の明細は自動の分類に戻り、行き先がなければ「その他」になります。`, { ok: '削除' }))) return;
    const r = deleteCategory(state, c.id);
    if (!r.ok) return ui.toast(REASON[r.reason]);
    await commit(r.state);
  }
});

document.addEventListener('change', async (e) => {
  const t = /** @type {HTMLInputElement} */ (e.target);
  const id = t.dataset.testid;
  if (id === 'tx-filter') {
    view.filter = t.value;
    view.limit = PAGE;
    render();
  } else if (id === 'category-edit') {
    const r = renameCategory(state, t.dataset.id ?? '', t.value);
    if (!r.ok) {
      ui.toast(REASON[r.reason]);
      t.value = catOf(t.dataset.id ?? '').name;
      return;
    }
    await commit(r.state);
  } else if (id === 'csv-file') await importFiles(t);
});

byTestId('tx-search').addEventListener('input', (e) => {
  view.query = /** @type {HTMLInputElement} */ (e.target).value;
  view.limit = PAGE;
  const all = resolveRows(state);
  renderList(view.month === 'all' ? all : all.filter((r) => r.ym === view.month));
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

/** @param {HTMLInputElement} input */
async function importFiles(input) {
  let next = state;
  let files = 0;
  let count = 0;
  const lines = [];
  for (const f of input.files ?? []) {
    try {
      const rows = readStatement(decodeText(await f.arrayBuffer()));
      next = putFile(next, f.name, rows);
      files++;
      count += rows.length;
    } catch (err) {
      lines.push(`${f.name}：${/** @type {Error} */ (err).message}`);
    }
  }
  input.value = '';
  const message = byTestId('import-message');
  message.classList.toggle('error', lines.length > 0);
  if (files) lines.unshift(`${files}ファイル・${count}件を読み込みました。`);
  message.textContent = lines.join('\n');
  if (files) {
    view.month = 'all';
    await commit(next);
  }
}

render();
