import * as utils from "./helpers";

describe("'is' utils", () => {
  type TestMap = Array<[any, any]>;

  const testUtil = (name: string, typeMaps: TestMap) => {
    const fn = utils[name];
    for (const [value, expected] of typeMaps) {
      it(`should test ${name} with value of ${JSON.stringify(value)} to equal ${expected}`, () => {
        expect(fn(value)).toBe(expected);
      });
    }
  };

  testUtil("isNullOrUndefined", [
    [undefined, true],
    [null, true],
    ["", false],
    [1, false],
    [true, false],
    [{}, false],
    [[], false]
  ]);
  testUtil("isArray", [
    [undefined, false],
    [null, false],
    ["", false],
    [1, false],
    [true, false],
    [{}, false],
    [[], true]
  ]);
  testUtil("isObject", [
    [undefined, false],
    [null, false],
    ["", false],
    [1, false],
    [true, false],
    [{}, true],
    [[], false]
  ]);
  testUtil("isString", [
    [undefined, false],
    [null, false],
    ["", true],
    [1, false],
    [true, false],
    [{}, false],
    [[], false]
  ]);
  testUtil("isNumber", [
    [undefined, false],
    [null, false],
    ["", false],
    [1, true],
    [true, false],
    [{}, false],
    [[], false]
  ]);
  testUtil("isBoolean", [
    [undefined, false],
    [null, false],
    ["", false],
    [1, false],
    [true, true],
    [{}, false],
    [[], false]
  ]);
  testUtil("isEmptyArray", [
    [undefined, false],
    [null, false],
    ["", false],
    [1, false],
    [true, false],
    [{}, false],
    [[], true],
    [["value"], false]
  ]);
  testUtil("isEmptyObject", [
    [undefined, false],
    [null, false],
    ["", false],
    [1, false],
    [true, false],
    [{}, true],
    [[], false],
    [{ key: "value" }, false]
  ]);
  testUtil("isEmptyValue", [
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

describe("'changed' utils", () => {
  type TestMap = Array<[any, any, any]>;

  const testUtil = (name: string, typeMaps: TestMap) => {
    const fn = utils[name];
    for (const [a, b, expected] of typeMaps) {
      it(`should test ${name} with value of ${JSON.stringify(a)} and ${JSON.stringify(b)} to equal ${expected}`, () => {
        expect(fn(a, b)).toBe(expected);
      });
    }
  };

  testUtil("valueChanged", [
    [undefined, undefined, false],
    [null, null, false],
    [1, 1, false],
    [true, true, false],
    ["", "", false],
    [{}, {}, true],
    [[], [], true]
  ]);
  testUtil("arrayChanged", [
    [undefined, undefined, false],
    [null, null, false],
    [null, [], true],
    [[], null, true],
    [[], [], false],
    [["value"], [], true],
    [[], ["value"], true],
    [["value"], ["value"], false],
    [["value"], ["changed"], true],
    [["changed"], ["value"], true]
  ]);
  testUtil("objectChanged", [
    [undefined, undefined, false],
    [null, null, false],
    [null, {}, true],
    [{}, null, true],
    [{}, {}, false],
    [{ key: "value" }, {}, true],
    [{}, { key: "value" }, true],
    [{ key: "value" }, { key: "value" }, false],
    [{ key: "value" }, { key: "changed" }, true],
    [{ key: "changed" }, { key: "value" }, true]
  ]);
});
