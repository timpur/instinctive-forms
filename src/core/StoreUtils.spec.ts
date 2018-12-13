import { StoreUtils } from "./StoreUtils";

const state = {
  item: "item0",
  level1: {
    item: "item1",
    level2: {
      item: "item2"
    }
  }
};

const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

describe("get store state", () => {
  it("should get root item", () => {
    expect(StoreUtils.get(state, undefined)).toEqual(state);
    expect(StoreUtils.get(state, null)).toEqual(state);
    expect(StoreUtils.get(state, "")).toEqual(state);
    expect(StoreUtils.get(state, "item")).toEqual(state.item);
  });
  it("should get level 1 item", () => {
    expect(StoreUtils.get(state, "level1")).toEqual(state.level1);
    expect(StoreUtils.get(state, "level1.item")).toEqual(state.level1.item);
  });
  it("should get level 2 item", () => {
    expect(StoreUtils.get(state, "level1.level2")).toEqual(state.level1.level2);
    expect(StoreUtils.get(state, "level1.level2.item")).toEqual(state.level1.level2.item);
  });
  it("should should return undefined for non existent paths", () => {
    expect(StoreUtils.get(state, "unknown")).toEqual(undefined);
  });
});

describe("set store state", () => {
  it("should set root item value", () => {
    const newState = StoreUtils.set(state, "item", "set");
    const expectedState = clone(state);
    expectedState.item = "set";

    expect(newState.item).not.toEqual(state.item);
    expect(newState).toMatchObject(expectedState);
  });
  it("should set level 1 item value", () => {
    const newState = StoreUtils.set(state, "level1.item", "set");
    const expectedState = clone(state);
    expectedState.level1.item = "set";

    expect(newState.level1.item).not.toEqual(state.level1.item);
    expect(newState).toMatchObject(expectedState);
  });
  it("should set level 2 item value", () => {
    const newState = StoreUtils.set(state, "level1.level2.item", "set");
    const expectedState = clone(state);
    expectedState.level1.level2.item = "set";

    expect(newState.level1.level2.item).not.toEqual(state.level1.level2.item);
    expect(newState).toMatchObject(expectedState);
  });
  it("should set new item value on root", () => {
    const newState: any = StoreUtils.set(state, "newItem", "set");
    const expectedState: any = clone(state);
    expectedState.newItem = "set";

    expect(newState).toMatchObject(state);
    expect(newState).toMatchObject(expectedState);
  });
  it("should set new item value on level 1", () => {
    const newState: any = StoreUtils.set(state, "level1.newItem", "set");
    const expectedState: any = clone(state);
    expectedState.level1.newItem = "set";

    expect(newState).toMatchObject(state);
    expect(newState).toMatchObject(expectedState);
  });
  it("should set new item value on level 2", () => {
    const newState: any = StoreUtils.set(state, "level1.level2.newItem", "set");
    const expectedState: any = clone(state);
    expectedState.level1.level2.newItem = "set";

    expect(newState).toMatchObject(state);
    expect(newState).toMatchObject(expectedState);
  });
  it("should throw when no path provided", () => {
    expect(() => StoreUtils.set(state, undefined, {})).toThrow();
    expect(() => StoreUtils.set(state, null, {})).toThrow();
    expect(() => StoreUtils.set(state, "", {})).toThrow();
  });
});

describe("merge store state", () => {
  it("should merge at root", () => {
    const expectMerge = newState => {
      const expectedState: any = clone(state);
      expectedState.item = "merge";

      expect(newState).toMatchObject(expectedState);
      expect(newState.merge).toEqual("merge");
    };
    expectMerge(StoreUtils.merge(state, undefined, { item: "merge", merge: "merge" }));
    expectMerge(StoreUtils.merge(state, null, { item: "merge", merge: "merge" }));
    expectMerge(StoreUtils.merge(state, "", { item: "merge", merge: "merge" }));
  });
  it("should merge at level1", () => {
    const newState: any = StoreUtils.merge(state, "level1", { item: "merge", merge: "merge" });
    const expectedState: any = clone(state);
    expectedState.level1.item = "merge";

    expect(newState).toMatchObject(expectedState);
    expect(newState.level1.merge).toEqual("merge");
  });
  it("should merge at level2", () => {
    const newState: any = StoreUtils.merge(state, "level1.level2", { item: "merge", merge: "merge" });
    const expectedState: any = clone(state);
    expectedState.level1.level2.item = "merge";

    expect(newState).toMatchObject(expectedState);
    expect(newState.level1.level2.merge).toEqual("merge");
  });
});

describe("set many paths at once", () => {
  it("should set many paths", () => {
    const newState = StoreUtils.setPaths(state, [
      { path: "item", value: "set" },
      { path: "level1.item", value: "set" },
      { path: "level1.level2.item", value: "set" }
    ]);
    const expectedState = clone(state);
    expectedState.item = "set";
    expectedState.level1.item = "set";
    expectedState.level1.level2.item = "set";

    expect(newState).toMatchObject(expectedState);
  });
});

describe("clean up of state", () => {
  it("should remove props via set", () => {
    expect(StoreUtils.set({ item: "value" }, "item", undefined)).toEqual({});
    expect(StoreUtils.set({ item: "value" }, "item", "")).toEqual({});
    expect(StoreUtils.set({ item: "value" }, "item", {})).toEqual({});
    expect(StoreUtils.set({ item: "value" }, "item", [])).toEqual({});
    expect(StoreUtils.set({ item: { item: "value" } }, "item.item", "")).toEqual({});
    expect(StoreUtils.set({ item: ["test"] }, "item.0", undefined)).toEqual({});
  });
});

describe("find prop form children", () => {
  it("should find all 'this' props in state", () => {
    const foundProps = StoreUtils.findPropFormChildren(
      { this: "this", level1: { this: "this", level2: { this: "this" } } },
      "this",
      null
    );
    expect(foundProps).toEqual([
      { path: "this", value: "this" },
      { path: "level1.this", value: "this" },
      { path: "level1.level2.this", value: "this" }
    ]);
  });
});
