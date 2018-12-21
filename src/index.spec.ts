import { setup, getConfig } from "./index";
import { TestAdapter } from "../tests/TestAdapter";

it("should throw error if not setup", () => {
  expect(() => getConfig()).toThrowError("Call setup before using config");
});

it("should set config", () => {
  setup(null);
  expect(getConfig()).toEqual({ storeAdapter: null });

  const adapter = new TestAdapter();
  setup(adapter);
  expect(getConfig()).toEqual({ storeAdapter: adapter });
});
