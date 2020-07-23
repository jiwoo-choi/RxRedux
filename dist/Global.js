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
import { DisposeBag } from "./";
//React.ComponentClass<Exclude<P , GlobalReactorProps<R,S>>> 
export default function Global(Component, key) {
    var _a;
    return _a = /** @class */ (function (_super) {
            __extends(class_1, _super);
            function class_1(props, context) {
                var _this = _super.call(this, props, context) || this;
                var globalContext = _this.context;
                _this._reactor = globalContext[key];
                if (_this._reactor) {
                    var state = _this._reactor.currentState;
                    _this.state = {
                        globalReactor: _this._reactor,
                        globalState: state,
                    };
                }
                return _this;
            }
            Object.defineProperty(class_1.prototype, "reactor", {
                set: function (newR) {
                    var _this = this;
                    var _a;
                    this._reactor = newR;
                    (_a = this.disposeBag) === null || _a === void 0 ? void 0 : _a.unsubscribe();
                    this.disposeBag = new DisposeBag();
                    this.setState({ globalReactor: newR, globalState: newR.currentState }, function () {
                        _this.disposeBag.disposeOf = _this.state.globalReactor.state.subscribe(function (res) { return _this.setState({ globalState: res }); });
                    });
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(class_1.prototype, "childProps", {
                get: function () {
                    console.log("child props called");
                    console.log(Component.displayName);
                    if (Component.displayName === "REACTORKIT_REACTIVE_VIEW") {
                        var a = this.childRef;
                        if (a) {
                            return a.childProps;
                        }
                        else {
                            return undefined;
                        }
                    }
                    else {
                        var a = this.childRef;
                        return a.props;
                    }
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(class_1.prototype, "childState", {
                get: function () {
                    if (Component.displayName === "REACTORKIT_REACTIVE_VIEW") {
                        var a = this.childRef;
                        if (a) {
                            return a.childState;
                        }
                        else {
                            return undefined;
                        }
                    }
                    else {
                        var a = this.childRef;
                        return a.state;
                    }
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(class_1.prototype, "childRef", {
                get: function () {
                    if (Component.displayName === "REACTORKIT_REACTIVE_VIEW") {
                        var a = this.childRef;
                        if (a) {
                            return a.childRef;
                        }
                        else {
                            return undefined;
                        }
                    }
                    else {
                        var a = this.childRef;
                        return this._childRef;
                    }
                },
                set: function (ref) {
                    this._childRef = ref;
                },
                enumerable: false,
                configurable: true
            });
            class_1.prototype.componentDidMount = function () {
                var _this = this;
                if (this._reactor) {
                    this.disposeBag = new DisposeBag();
                    this.disposeBag.disposeOf = this.state.globalReactor.state.subscribe(function (res) { return _this.setState({ globalState: res }); });
                }
            };
            class_1.prototype.componentWillUnmount = function () {
                var _a;
                (_a = this.disposeBag) === null || _a === void 0 ? void 0 : _a.unsubscribe();
                //테스트해야됨.
            };
            class_1.prototype.render = function () {
                var _this = this;
                return React.createElement(Component, __assign({}, this.props, this.state, { ref: function (ref) { return _this.childRef = ref; } }));
            };
            return class_1;
        }(React.Component)),
        _a.displayName = "REACTORKIT_GLOBAL",
        _a.contextType = GlobalReactor,
        _a;
}
