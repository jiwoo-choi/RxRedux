var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React from "react";
import { GlobalReactor } from "./GlobalStore";
export default function ReactiveView(Component) {
    var A = /** @class */ (function (_super) {
        __extends(A, _super);
        function A(props) {
            var _this = _super.call(this, props) || this;
            if (Component.displayName === "REACTORKIT_GLOBAL") {
                console.error("ERROR : GLOBAL SHOULD BE MOST OUTSIDE OF COMPONENT");
            }
            return _this;
        }
        Object.defineProperty(A.prototype, "childProps", {
            get: function () {
                var a = this.childRef;
                return a.props;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(A.prototype, "childState", {
            get: function () {
                var a = this.childRef;
                return a.state;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(A.prototype, "childRef", {
            get: function () {
                return this._childRef;
            },
            set: function (ref) {
                this._childRef = ref;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(A.prototype, "reactor", {
            get: function () {
                return this._reactor;
            },
            set: function (newR) {
                var _a;
                this._reactor = newR;
                (_a = this.disposeBag) === null || _a === void 0 ? void 0 : _a.unsubscribe();
                var a = this.childRef;
                this.disposeBag = a.bind(newR);
            },
            enumerable: false,
            configurable: true
        });
        A.prototype.componentWillMount = function () {
        };
        A.prototype.componentDidMount = function () {
            var view = this.childRef;
            this._reactor = view.reactor;
            if (this._reactor) {
                this.disposeBag = view.bind(this._reactor);
            }
            else {
                console.warn("NO REACTOR BINDED");
            }
        };
        A.prototype.componentWillUnmount = function () {
            var _a;
            if (this.disposeBag) {
                this.disposeBag.unsubscribe();
            }
            (_a = this._reactor) === null || _a === void 0 ? void 0 : _a.disposeAll();
            this._reactor = null;
        };
        A.prototype.render = function () {
            var _this = this;
            return (React.createElement(Component, __assign({}, this.props, { ref: function (ref) { return _this.childRef = ref; } })));
        };
        A.contextType = GlobalReactor;
        A.displayName = 'REACTORKIT_REACTIVE_VIEW';
        return A;
    }(React.PureComponent));
    return A;
}
