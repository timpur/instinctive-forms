import * as dotProp from "dot-prop-immutable";
import { TStoreValue } from "../types";
import { isObject, isEmptyValue } from "../helpers";

const getParentPath = (path: string) =>
  path
    .split(".")
    .slice(0, -1)
    .join(".");
const isRoot = (path: string = "") => path.length === 0;

export const cleanUpEmptyParentsRecursively = (state: any, path: string) => {
  const value = get(state, path);
  const needToRemoveProp = isEmptyValue(value) && value !== null;
  // no clean up needed, since value has a valid value
  if (!needToRemoveProp) return state;
  const cleanedState = dotProp.delete(state, path); // https://github.com/debitoor/dot-prop-immutable/pull/28
  // if path is at root then clean up is done
  if (isRoot(path)) return cleanedState;
  // since were not at the root, keep cleaning up parents
  const parentPath = getParentPath(path);
  return cleanUpEmptyParentsRecursively(cleanedState, parentPath);
};

const get = (state: TStoreValue, path: string, defaultValue?: TStoreValue): TStoreValue => {
  if (!path) return state;
  return dotProp.get(state, path, defaultValue);
};

const set = <TState = TStoreValue>(state: TState, path: string, value: TStoreValue): TState => {
  if (!path) throw new Error("Path can not be undefined, null or empty");
  const changedState = dotProp.set(state, path, value);
  return cleanUpEmptyParentsRecursively(changedState, path);
};

const merge = <TState = TStoreValue>(state: TState, path: string, value: object | []): TState => {
  let changedState;
  if (!path) changedState = dotProp.merge({ state }, "state", value).state;
  else changedState = dotProp.merge(state, path, value);
  return cleanUpEmptyParentsRecursively(changedState, path);
};

const setPaths = <TState = TStoreValue>(state: TState, paths: Array<{ path: string; value: TStoreValue }>): TState => {
  return paths.reduce((obj, { path, value }) => StoreUtils.set(obj, path, value), state);
};

const findPropFormChildren = (
  state: TStoreValue,
  prop: string,
  path: string = null
): Array<{ path: string; value: TStoreValue }> => {
  if (!isObject(state)) return [];

  const keys = Object.keys(state);
  return keys
    .map(stateKey => {
      const newPath = path ? `${path}.${stateKey}` : stateKey;
      if (stateKey === prop) return [{ path: newPath, value: state[stateKey] }];
      else if (isObject(state[stateKey])) {
        return findPropFormChildren(state[stateKey], prop, newPath);
      }
    })
    .reduce((result, items) => (items ? [...result, ...items] : result), []);
};

export const StoreUtils = {
  get,
  set,
  merge,
  setPaths,
  findPropFormChildren
};
