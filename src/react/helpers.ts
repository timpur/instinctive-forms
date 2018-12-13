import { ReactElement, ComponentType } from "react";
import { Omit } from "../types";

export type Child<P = any> = ((props: P) => any) | ReactElement<any>;

export const renderChildrenWithProps = <P = {}>(children: Child<P> | Array<Child<P>>, props: P) => {
  const mapChild = child => {
    if (typeof child === "function") return child(props);
    return child;
  };

  return Array.isArray(children) ? children.map(mapChild) : mapChild(children);
};

export type HOC<N> = <P extends N, R = Omit<P, keyof N>>(Component: ComponentType<P>) => ComponentType<R>;
