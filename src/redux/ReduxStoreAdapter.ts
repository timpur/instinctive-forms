import { Store, Action } from "redux";
import { StoreAdapter } from "../core/StoreAdapter";
import { StoreUtils } from "../core/StoreUtils";
import { TPrimitive, Callback } from "../types";
import { Reducer } from "react";

type ACTIONS = {
  SET: "SET";
  MERGE: "MERGE";
  SET_PATHS: "SET_PATHS";
};
export const ACTIONS: ACTIONS & Object = {
  SET: "SET",
  MERGE: "MERGE",
  SET_PATHS: "SET_PATHS"
};

export type SetAction = Action<ACTIONS["SET"]> & { path: string; value: TPrimitive };
export type MergeAction = Action<ACTIONS["MERGE"]> & { path: string; value: object | [] };
export type SetPathsAction = Action<ACTIONS["SET_PATHS"]> & { paths: Array<{ path: string; value: TPrimitive }> };

export const reduxActionsCreators = {
  set: (path: string, value: TPrimitive): SetAction => ({ type: ACTIONS.SET, path, value }),
  merge: (path: string, value: object | []): MergeAction => ({ type: ACTIONS.MERGE, path, value }),
  setPaths: (paths: Array<{ path: string; value: TPrimitive }>): SetPathsAction => ({ type: ACTIONS.SET_PATHS, paths })
};

export const reduxReducer: Reducer<object, SetAction | MergeAction | SetPathsAction> = (state = {}, action) => {
  switch (action.type) {
    case ACTIONS.SET:
      return StoreUtils.set(state, action.path, action.value);
    case ACTIONS.MERGE:
      return StoreUtils.merge(state, action.path, action.value);
    case ACTIONS.SET_PATHS:
      return StoreUtils.setPaths(state, action.paths);
    default:
      return state;
  }
};

export const createReduxReducer: <TState extends object, TActions extends Action>(
  rootReducer?: Reducer<TState, TActions>
) => Reducer<TState, TActions | SetAction | MergeAction | SetPathsAction> = reducer => (state, action) => {
  if (ACTIONS.hasOwnProperty(action.type)) {
    return reduxReducer(state, action as any) as any;
  } else if (reducer) return reducer(state, action as any);
  else return state;
};

export class ReduxStoreAdapter<TState extends object = {}> extends StoreAdapter<TState> {
  store: Store<TState>;
  constructor(store: Store<TState>) {
    super();
    this.store = store;
  }

  state = () => this.store.getState();
  subscribe = (fn: Callback) => this.store.subscribe(fn);
  _get = (path, defaultValue) => StoreUtils.get(this.state(), path, defaultValue);
  _set = (path, value) => this.store.dispatch(reduxActionsCreators.set(path, value));
  _merge = (path, value) => this.store.dispatch(reduxActionsCreators.merge(path, value));
  _setPaths = paths => this.store.dispatch(reduxActionsCreators.setPaths(paths));
}
