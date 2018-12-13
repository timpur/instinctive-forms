import * as utils from "./index";

type TestMap = Array<[any, any]>;

const testValues = (name: string, fn: (value: any) => any, typeMaps: TestMap) => {
  for (const [value, expected] of typeMaps) {
    it(`should test ${name} with value of ${JSON.stringify(value)} to equal ${expected}`, () => {
      expect(fn(value)).toBe(expected);
    });
  }
};

describe("should test is of utils", () => {
  testValues("isNullOrUndefined", utils.isNullOrUndefined, [
    [undefined, true],
    [null, true],
    ["", false],
    [1, false],
    [true, false],
    [{}, false],
    [[], false]
  ]);
  testValues("isArray", utils.isArray, [
    [undefined, false],
    [null, false],
    ["", false],
    [1, false],
    [true, false],
    [{}, false],
    [[], true]
  ]);
  testValues("isObject", utils.isObject, [
    [undefined, false],
    [null, false],
    ["", false],
    [1, false],
    [true, false],
    [{}, true],
    [[], false]
  ]);
  testValues("isString", utils.isString, [
    [undefined, false],
    [null, false],
    ["", true],
    [1, false],
    [true, false],
    [{}, false],
    [[], false]
  ]);
  testValues("isNumber", utils.isNumber, [
    [undefined, false],
    [null, false],
    ["", false],
    [1, true],
    [true, false],
    [{}, false],
    [[], false]
  ]);
  testValues("isBoolean", utils.isBoolean, [
    [undefined, false],
    [null, false],
    ["", false],
    [1, false],
    [true, true],
    [{}, false],
    [[], false]
  ]);
  testValues("isEmptyArray", utils.isEmptyArray, [
    [undefined, false],
    [null, false],
    ["", false],
    [1, false],
    [true, false],
    [{}, false],
    [[], true],
    [["value"], false]
  ]);
  testValues("isEmptyObject", utils.isEmptyObject, [
    [undefined, false],
    [null, false],
    ["", false],
    [1, false],
    [true, false],
    [{}, true],
    [[], false],
    [{ key: "value" }, false]
  ]);
  testValues("isEmptyValue", utils.isEmptyValue, [
    [undefined, true],
    [null, false],
    ["", true],
    [1, false],
    [true, false],
    [{}, true],
    [[], true],
    [{ key: "value" }, false],
    [{ key: "value" }, false]
  ]);
});
