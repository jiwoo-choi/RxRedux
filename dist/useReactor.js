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
import { DisposeBag } from "./";
import React from "react";
import { debounceTime } from "rxjs/operators";
export default function ReactiveView(Component) {
    var A = /** @class */ (function (_super) {
        __extends(A, _super);
        function A(props) {
            var _this = _super.call(this, props) || this;
            if (Component.displayName === "REACTORKIT_GLOBAL") {
                console.error("ERROR : GLOBAL SHOULD BE MOST OUTSIDE OF COMPONENT");
            }
            _this.state = { updatar: 1 };
            return _this;
        }
        A.prototype.UNSAFE_componentWillMount = function () {
            /** Check its props whether it has Reactor or not */
            for (var _i = 0, _a = Object.entries(this.props); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], value = _b[1];
                if (value) {
                    if (value.REACTORID$) {
                        this._parentReactor = value;
                    }
                }
            }
        };
        A.prototype.componentDidMount = function () {
            var _this = this;
            var _a, _b;
            this.disposeBag = new DisposeBag();
            /** Check its children whether it has Reactor or not */
            for (var _i = 0, _c = Object.entries(this._childRef); _i < _c.length; _i++) {
                var _d = _c[_i], key = _d[0], value = _d[1];
                if (value) {
                    if (value.REACTORID$) {
                        this._localReactor = value;
                    }
                }
            }
            /** Parent's props's state are  */
            this.disposeBag.disposeOf = (_a = this._parentReactor) === null || _a === void 0 ? void 0 : _a.state.pipe(debounceTime(100)).subscribe(function (res) {
                _this.setState({ updatar: _this.state.updatar * -1 });
            });
            this.disposeBag.disposeOf = (_b = this._localReactor) === null || _b === void 0 ? void 0 : _b.state.subscribe(function (res) { return _this.setState({ updatar: _this.state.updatar * -1 }); });
        };
        A.prototype.componentWillUnmount = function () {
            var _a, _b;
            /** unsubscribe and release localReactor */
            (_a = this.disposeBag) === null || _a === void 0 ? void 0 : _a.unsubscribe();
            (_b = this._localReactor) === null || _b === void 0 ? void 0 : _b.disposeAll();
            this._localReactor = null;
        };
        A.prototype.render = function () {
            var _this = this;
            return (React.createElement(Component, __assign({}, this.props, { ref: function (ref) { return _this._childRef = ref; }, updatar: this.state.updatar })));
        };
        A.displayName = 'REACTORKIT_REACTIVE_VIEW';
        return A;
    }(React.PureComponent));
    return A;
}
