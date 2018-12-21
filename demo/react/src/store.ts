import { createStore, Store, Action } from "redux";
import { devToolsEnhancer } from "redux-devtools-extension";
import { setup } from "../../../src";
import { ReduxStoreAdapter, createReduxReducer } from "../../../src/redux/ReduxStoreAdapter";

export const store: Store<{}> = createStore(createReduxReducer(), {}, devToolsEnhancer({}));
setup(new ReduxStoreAdapter(store));
