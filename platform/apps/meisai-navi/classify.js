// @ts-check
// 店名から費目を自動で決める。DOM に触れない。

const SMALL = 'ァィゥェォッャュョヮぁぃぅぇぉっゃゅょ';
const BIG = 'アイウエオツヤユヨワあいうえおつやゆよ';

/** 半角カナ→全角、英字→大文字、小書きのカナ→大書き。 @param {string} name */
export const normalize = (name) =>
  String(name).normalize('NFKC').toUpperCase().replace(/[ァィゥェォッャュョヮぁぃぅぇぉっゃゅょ]/g, (c) => BIG[SMALL.indexOf(c)]);

/** 店を見分けるキー。normalize した上で空白と記号を除く。 @param {string} name */
export const shopKey = (name) => normalize(name).replace(/[\s\-‐‑–—―−・.,/*'’"()]/g, '');

/** キーワード表：[費目ID, 細目(tag), 空白区切りのキーワード]。細目は節約ポイントが使う。 */
const TABLE = [
  ['food', 'conv', 'セブンイレブン セブンーイレブン ローソン ファミリーマート ファミマ ミニストップ デイリーヤマザキ セイコーマート ニューデイズ NEWDAYS'],
  ['food', 'super', 'イオン マックスバリュ 西友 イトーヨーカドー ヨークマート 業務スーパー 成城石井 まいばすけっと オーケー サミット ヤオコー コープ 生協 マルエツ ベルク ロピア コストコ ライフ スーパー オオゼキ 東急ストア 阪急オアシス 万代 カスミ ベイシア トライアル オイシックス パルシステム 青果 精肉 ベーカリー'],
  ['dining', 'deli', 'UBEREATS 出前館 WOLT'],
  ['dining', 'cafe', 'スターバックス STARBUCKS ドトール タリーズ コメダ サンマルク エクセルシオール 珈琲 コーヒー カフェ CAFE'],
  ['dining', 'rest', 'マクドナルド すき家 吉野家 松屋 ガスト サイゼリヤ くら寿司 スシロー はま寿司 ケンタッキー KFC モスバーガー 丸亀製麺 鳥貴族 ココス デニーズ バーミヤン ジョナサン 王将 一蘭 ココイチ COCO壱 ミスタードーナツ 食べログ ホットペッパーグルメ レストラン 居酒屋 焼肉 ラーメン 寿司 食堂 酒場 ダイニング バーガーキング サブウェイ 大戸屋 やよい軒 天下一品 餃子'],
  ['shop', 'ec', 'AMAZON アマゾン 楽天市場 YAHOO ヤフー ZOZO メルカリ QOO10 SHEIN TEMU ALIEXPRESS ヨドバシ ビックカメラ LOHACO ASKUL モノタロウ ラクマ'],
  ['shop', 'daily', 'マツモトキヨシ マツキヨ ウエルシア スギ薬局 ツルハ サンドラッグ ココカラファイン ドラッグ 薬局 ダイソー セリア キャンドゥ ニトリ 無印良品 カインズ コーナン ホームセンター ドンキホーテ ロフト ハンズ IKEA ヤマダデンキ ケーズデンキ エディオン'],
  ['shop', 'wear', 'ユニクロ UNIQLO ジーユー しまむら ZARA H&M ABCマート ワークマン 洋服の青山 ビームス 美容室 美容院 ヘアサロン QBハウス 理容'],
  ['subs', 'subs', 'NETFLIX SPOTIFY APPLECOMBILL ITUNES GOOGLE YOUTUBE AMAZONPRIME AMAZONプライム プライム会費 DISNEY ディズニープラス HULU UNEXT DAZN ABEMA ADOBE MICROSOFT OPENAI CHATGPT ANTHROPIC CLAUDE GITHUB NOTION DROPBOX ICLOUD KINDLE AUDIBLE NINTENDO ニンテンドー PLAYSTATION STEAM ニコニコ DMM 楽天マガジン 楽天ミュージック NHK 日経 新聞 CURSOR ZOOM CANVA 1PASSWORD EVERNOTE'],
  ['util', 'tel', 'ドコモ DOCOMO KDDI ソフトバンク SOFTBANK 楽天モバイル UQモバイル UQMOBILE ワイモバイル YMOBILE IIJ MINEO NURO ビッグローブ BIGLOBE OCN SONET フレッツ NTT 楽天ひかり AHAMO LINEMO POVO イオンモバイル 日本通信'],
  ['util', 'energy', '電力 電気 でんき ガス 水道 TEPCO エネルギー 楽天でんき ENEOSでんき'],
  ['move', 'move', 'JR SUICA PASMO ICOCA ETC 高速道路 NEXCO タクシー ENEOS 出光 アポロステーション コスモ石油 昭和シェル ガソリン 駐車 タイムズ パーキング 新幹線 EX予約 スマートEX えきねっと バス カーシェア 車検 オートバックス イエローハット 鉄道 地下鉄 メトロ 電鉄 JAL 航空 PEACH ジェットスター'],
  ['fun', 'fun', '映画 シネマ イオンシネマ TOHO カラオケ 書店 ブックオフ 紀伊國屋 TSUTAYA 蔦屋 ゲーム チケット ぴあ ローチケ イープラス ホテル 旅館 楽天トラベル じゃらん BOOKING AIRBNB AGODA EXPEDIA ディズニーリゾート USJ ゴルフ スポーツ 楽天ブックス 楽天KOBO 温泉 レジャー 一休 アニメイト 模型 LEGO'],
  ['life', 'life', '病院 クリニック 医院 歯科 眼科 調剤 保険 生命 損保 共済 年金 税 ふるさと納税 さとふる 塾 スクール 大学 UDEMY 公文 学習 教室 エニタイム チョコザップ CHOCOZAP フィットネス コナミスポーツ'],
];
/** @type {[string, string, string][]} [キー, 費目ID, 細目] */
const KEYWORDS = TABLE.flatMap(([cat, tag, words]) => words.split(' ').map((w) => /** @type {[string, string, string]} */ ([shopKey(w), cat, tag])));
/** 短くて部分一致では誤る英字。単語として現れたときだけ採る。 @type {[RegExp, string, string][]} */
const WORDS = [[/\bAU\b/, 'util', 'tel'], [/\bANA\b/, 'move', 'move'], [/\bGU\b/, 'shop', 'wear']];

/** @type {Map<string, { cat: string, tag: string }>} */
const cache = new Map();

/** 店名から費目IDと細目を決める。当てはまらなければ other。 @param {string} name @returns {{ cat: string, tag: string }} */
export function autoClassify(name) {
  const key = shopKey(name);
  const hit = cache.get(key);
  if (hit) return hit;
  let found = { cat: 'other', tag: '' };
  let best = 0;
  for (const [k, cat, tag] of KEYWORDS) {
    if (k.length > best && key.includes(k)) { best = k.length; found = { cat, tag }; }
  }
  if (best < 3) {
    const n = normalize(name);
    for (const [re, cat, tag] of WORDS) if (re.test(n)) { found = { cat, tag }; break; }
  }
  cache.set(key, found);
  return found;
}
