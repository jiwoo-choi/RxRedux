import { Subscription } from 'rxjs';
export default class DisposeBag {
    private subscriptions;
    private namedSubscriptions;
    constructor();
    set disposeOf(subscription: Subscription);
    add(subscription: Subscription, name?: string): void;
    unsubscribe(name?: string): void;
}
