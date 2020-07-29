import { forOwn } from 'lodash';
import { Subscription } from 'rxjs';

// disposebag : https://github.com/RonasIT/dispose-bag

export default class DisposeBag {
  private subscriptions: Subscription;
  private namedSubscriptions: { [name: string]: Subscription };

  constructor() {
    this.subscriptions = new Subscription();
    this.namedSubscriptions = {};
  }

  set disposeOf(subscription : Subscription | undefined) {
    if (subscription) {
      this.subscriptions.add(subscription)
    }
  }
  
  public add(subscription: Subscription, name?: string): void {
    if (name) {
      this.namedSubscriptions[name] = subscription;
    } else {
      this.subscriptions.add(subscription);
    }
  }

  public unsubscribe(name?: string): void {
    if (name) {
      if (this.namedSubscriptions.hasOwnProperty(name) && this.namedSubscriptions[name]) {
        this.namedSubscriptions[name].unsubscribe();
      }
    } else {
      this.subscriptions.unsubscribe();
      forOwn(this.namedSubscriptions, (subscription: Subscription) => {
        subscription.unsubscribe();
      });
    }
  }
}
