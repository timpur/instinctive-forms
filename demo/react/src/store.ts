import { createStore, Reducer, Action } from "redux";
import { StoreUtils } from "../../../src/core/StoreUtils";
import { StoreAdapter } from "../../../src/core/StoreAdapter";
import { setup } from "../../../src";

interface IState {
  form?: {
    group?: {
      input1?: string;
    };
  };
}

const initialState: IState = {
  form: {
    group: {
      input1: "initial"
    }
  }
};

type SetAction = Action<"set"> & { path: string; value: any };
type MergeAction = Action<"merge"> & { path: string; value: any };
type SetPathsAction = Action<"setPaths"> & { paths: Array<{ path: string; value: any }> };
type Actions = Action<"init"> | SetAction | MergeAction | SetPathsAction;

const reducer: Reducer<IState, Actions> = (state = initialState, action) => {
  switch (action.type) {
    case "set":
      return StoreUtils.set(state, action.path, action.value);
    case "merge":
      return StoreUtils.merge(state, action.path, action.value);
    case "setPaths":
      return StoreUtils.setPaths(state, action.paths);
    default:
      return state;
  }
};

export const store = createStore(reducer, initialState);
store.dispatch({ type: "init" });
console.log("State:", store.getState());

export class ReduxAdapter extends StoreAdapter<IState> {
  state = () => store.getState();
  subscribe = store.subscribe;
  _get = (path, defaultValue) => StoreUtils.get(this.state(), path, defaultValue);
  _set = (path, value) => store.dispatch({ type: "set", path, value });
  _merge = (path, value) => store.dispatch({ type: "merge", path, value });
  _setPaths = paths => store.dispatch({ type: "setPaths", paths });
}

setup(new ReduxAdapter());
