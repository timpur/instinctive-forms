import { IStoreAdapter, StoreAdapter } from "./StoreAdapter";
import { buildPath } from "../helpers";
import { TStoreValue } from "../types";
import { getConfig } from "../index";

export class StoreContext<TState = {}, TStoreState = {}> implements IStoreAdapter<TState> {
  public readonly adapter: StoreAdapter<TStoreState>;
  public readonly basePath: string;

  constructor(path: string, adapter?: StoreAdapter<TStoreState>) {
    this.basePath = path;
    this.adapter = adapter || getConfig().storeAdapter;
  }

  state(): TState {
    return this.adapter.get(this.basePath) as any;
  }

  get(path: string, defaultValue?: TStoreValue) {
    const fullPath = buildPath(this.basePath, path);
    return this.adapter.get(fullPath, defaultValue);
  }
  set(path: string, value: TStoreValue) {
    const fullPath = buildPath(this.basePath, path);
    return this.adapter.set(fullPath, value);
  }
  merge(path: string, value: object | []) {
    const fullPath = buildPath(this.basePath, path);
    return this.adapter.merge(fullPath, value);
  }
  setPaths(paths: Array<{ path: string; value: TStoreValue }>) {
    const fullPaths = paths.map(({ path, value }) => ({ path: buildPath(this.basePath, path), value }));
    this.adapter.setPaths(fullPaths);
    return this.state();
  }
}
