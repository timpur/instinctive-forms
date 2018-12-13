import { setup, getConfig } from "./index";
import { StoreAdapter } from "./core/StoreAdapter";
import { TStoreValue } from "./types";

class TestAdapter extends StoreAdapter {
  private _state = {};
  state = () => this._state;
  connectWithStoreState = null;

  _get = (path: string) => this.state[path];
  _set = (path: string, value: TStoreValue) => (this.state[path] = value);
  _merge = (path: string, value: object | []) => this._set(path, value);
  _setPaths = (paths: Array<{ path: string; value: TStoreValue }>) => {
    for (const { path, value } of paths) {
      this._set(path, value);
    }
  };
}

it("should set config", () => {
  setup(null);
  expect(getConfig()).toEqual({ storeAdapter: null });

  const adapter = new TestAdapter();
  setup(adapter);
  expect(getConfig()).toEqual({ storeAdapter: adapter });
});
