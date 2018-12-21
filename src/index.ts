import { StoreAdapter } from "./core/StoreAdapter";

type Config = {
  storeAdapter: StoreAdapter<any>;
};

export let config: Readonly<Config> = null;

export const setup = (storeAdapter: StoreAdapter<any>) => {
  config = {
    storeAdapter
  };
};

export const getConfig = () => {
  if (!config) throw new Error("Call setup before using config");
  return config;
};
