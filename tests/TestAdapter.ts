import { StoreAdapter } from "../src/core/StoreAdapter";
import { TStoreValue } from "../src/types";
import { StoreUtils } from "../src/core/StoreUtils";
import { Subscription } from "../src/core/Subscription";

export class TestAdapter extends StoreAdapter {
  private _state = {};
  private _subscription = new Subscription();
  private setState(state: any) {
    this._state = state;
    this._subscription.invoke();
  }

  state = () => this._state;
  subscribe = cb => this._subscription.subscribe(cb);

  _get = (path: string, defaultValue?: TStoreValue) => StoreUtils.get(this.state(), path) || defaultValue;
  _set = (path: string, value: TStoreValue) => this.setState(StoreUtils.set(this.state(), path, value));
  _merge = (path: string, value: object | []) => this.setState(StoreUtils.merge(this.state(), path, value));
  _setPaths = (paths: Array<{ path: string; value: TStoreValue }>) =>
    this.setState(StoreUtils.setPaths(this.state(), paths));
}
