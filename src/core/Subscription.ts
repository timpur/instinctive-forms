export type Subscriber<TArgs extends any[]> = (...args: TArgs) => void;

export class Subscription<TArgs extends any[]> {
  subscribers: Array<Subscriber<TArgs>> = [];

  subscribe(cb: Subscriber<TArgs>) {
    this.subscribers.push(cb);
    return () => this.unsubscribe(cb);
  }

  unsubscribe(cb: Subscriber<TArgs>) {
    const index = this.subscribers.indexOf(cb);

    if (index !== -1) this.subscribers.splice(index, 1);
  }

  invoke(...args: TArgs) {
    this.subscribers.forEach(subscriber => subscriber(...args));
  }
}

export const connectSubscription = <TArgs extends any[]>(sub1: Subscription<TArgs>, sub2: Subscription<TArgs>) =>
  sub1.subscribe((...args) => sub2.invoke(...args));
