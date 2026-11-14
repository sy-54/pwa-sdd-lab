import { describe, it, expect } from "vitest";
import { increment, decrement, reset, parseCount } from "../../apps/counter/counter.js";

describe("increment", () => {
  it("1増やす", () => {
    expect(increment(0)).toBe(1);
    expect(increment(5)).toBe(6);
  });
});

describe("decrement", () => {
  it("1減らす", () => {
    expect(decrement(5)).toBe(4);
  });

  it("0のときは0未満にしない", () => {
    expect(decrement(0)).toBe(0);
  });
});

describe("reset", () => {
  it("常に0を返す", () => {
    expect(reset()).toBe(0);
    expect(reset(3)).toBe(0);
  });
});

describe("parseCount", () => {
  it("0以上の整数文字列を数値として解釈する", () => {
    expect(parseCount("0")).toBe(0);
    expect(parseCount("3")).toBe(3);
  });

  it("存在しない値は0として扱う", () => {
    expect(parseCount(null)).toBe(0);
    expect(parseCount(undefined)).toBe(0);
  });

  it("不正な文字列は0として扱う", () => {
    expect(parseCount("abc")).toBe(0);
    expect(parseCount("")).toBe(0);
  });

  it("負の数は0として扱う", () => {
    expect(parseCount("-1")).toBe(0);
  });

  it("小数は0として扱う", () => {
    expect(parseCount("1.5")).toBe(0);
  });
});
