import { TStoreValue, Callback, Selector } from "../types";
import { ChangeDetection, objectChanged } from "../helpers";

export interface IStoreAdapter<TState = {}> {
  state(): TState;
  get(path: string, defaultValue?: TStoreValue): TStoreValue;
  set(path: string, value: TStoreValue): TStoreValue;
  merge(path: string, value: object | []): TStoreValue;
  setPaths(paths: Array<{ path: string; value: TStoreValue }>): TState;
}

export abstract class StoreAdapter<TState = {}> implements IStoreAdapter<TState> {
  abstract state(): TState;
  abstract subscribe(cb: Callback): Callback;

  abstract _get(path: string, defaultValue?: TStoreValue): TStoreValue;
  abstract _set(path: string, value: TStoreValue);
  abstract _merge(path: string, value: TStoreValue);
  abstract _setPaths(paths: Array<{ path: string; value: TStoreValue }>);

  get(path: string, defaultValue?: TStoreValue) {
    return this._get(path, defaultValue);
  }
  set(path: string, value: TStoreValue) {
    this._set(path, value);
    return this.get(path);
  }
  merge(path: string, value: object | []) {
    this._merge(path, value);
    return this.get(path);
  }
  setPaths(paths: Array<{ path: string; value: TStoreValue }>) {
    this._setPaths(paths);
    return this.state();
  }
}

export const StoreConnect = (storeAdapter: StoreAdapter, update: Callback, ...paths: string[]) => {
  const getCurrentState: Selector<object> = () =>
    paths
      .map(path => [path, storeAdapter.get(path)])
      .reduce((state, [path, value]) => {
        state[path as string] = value;
        return state;
      }, {});
  const changeDetection = new ChangeDetection(getCurrentState(), objectChanged);
  return storeAdapter.subscribe(() => {
    if (changeDetection.check(getCurrentState())) update();
  });
};
