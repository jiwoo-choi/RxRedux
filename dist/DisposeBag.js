import { forOwn } from 'lodash';
import { Subscription } from 'rxjs';
// disposebag : https://github.com/RonasIT/dispose-bag
var DisposeBag = /** @class */ (function () {
    function DisposeBag() {
        this.subscriptions = new Subscription();
        this.namedSubscriptions = {};
    }
    Object.defineProperty(DisposeBag.prototype, "disposeOf", {
        set: function (subscription) {
            if (subscription) {
                this.subscriptions.add(subscription);
            }
        },
        enumerable: false,
        configurable: true
    });
    DisposeBag.prototype.add = function (subscription, name) {
        if (name) {
            this.namedSubscriptions[name] = subscription;
        }
        else {
            this.subscriptions.add(subscription);
        }
    };
    DisposeBag.prototype.unsubscribe = function (name) {
        if (name) {
            if (this.namedSubscriptions.hasOwnProperty(name) && this.namedSubscriptions[name]) {
                this.namedSubscriptions[name].unsubscribe();
            }
        }
        else {
            this.subscriptions.unsubscribe();
            forOwn(this.namedSubscriptions, function (subscription) {
                subscription.unsubscribe();
            });
        }
    };
    return DisposeBag;
}());
export default DisposeBag;
