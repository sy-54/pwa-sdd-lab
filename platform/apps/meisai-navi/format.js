// @ts-check
// 表示形式。DOM に触れない。

/** 金額。数字と3桁区切りのカンマのみ（負は先頭に -）。 @param {number} n */
export const yen = (n) => {
  const v = Math.round(n);
  return (v < 0 ? '-' : '') + Math.abs(v).toLocaleString('en-US');
};

/** 割合。小数1桁と %。 @param {number} part @param {number} total */
export const share = (part, total) => (total > 0 ? (Math.round((part / total) * 1000) / 10).toFixed(1) : '0.0') + '%';

/** 月の表示名。 @param {string} ym YYYY-MM @param {boolean} [long] */
export const monthLabel = (ym, long = false) => {
  const [y, m] = ym.split('-');
  return long ? `${y}年${Number(m)}月` : `${Number(m)}月`;
};
