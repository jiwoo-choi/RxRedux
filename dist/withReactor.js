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
import { debounceTime, map, skip } from "rxjs/operators";
import { deepDistinctUntilChanged } from "./RxjsExtension";
/**
 *
 * @param Component State변경을 구독받을 컴포넌트.
 * @param parentFilterMapper State 변경중에 특정 변경만 구독하도록 함.
 * @param transfromStateStreamFromThisComponent Children 컴포넌트에 맵핑 유지.
 * @param skipSync 리액터의 initial 업데이트를 방지 여부. 로드시 필요없는 랜더링을 방지함.
 */
export default function withReactor(Component, parentFilterMapper, transfromStateStreamFromThisComponent, skipSync) {
    if (transfromStateStreamFromThisComponent === void 0) { transfromStateStreamFromThisComponent = true; }
    if (skipSync === void 0) { skipSync = true; }
    var A = /** @class */ (function (_super) {
        __extends(A, _super);
        function A(props) {
            var _this = _super.call(this, props) || this;
            _this.disposeBag = null;
            if (Component.displayName === "REACTORKIT_GLOBAL") {
                console.error("ERROR : GLOBAL SHOULD BE MOST OUTSIDE OF COMPONENT");
            }
            _this.state = { updatar: 1 };
            return _this;
        }
        A.prototype.UNSAFE_componentWillMount = function () {
            var _this = this;
            this.disposeBag = new DisposeBag();
            function customMapper(filterMapper) {
                if (filterMapper) {
                    return map(filterMapper);
                }
                else {
                    return map(function (value) { return value; });
                }
            }
            if (this.props.reactor_control) {
                this._parentStateStream = this.props.reactor_control.stateStream;
                var newReactorControl = __assign({}, this.props.reactor_control);
                if (transfromStateStreamFromThisComponent && parentFilterMapper) {
                    newReactorControl.stateStream = this.props.reactor_control.stateStream.pipe(customMapper(parentFilterMapper));
                    this.nextControls = { reactor_control: newReactorControl };
                }
                else {
                    this.nextControls = { reactor_control: newReactorControl };
                }
            }
            if (this._parentStateStream) {
                this.disposeBag.disposeOf = this._parentStateStream.pipe(customMapper(parentFilterMapper), deepDistinctUntilChanged(), skip((skipSync ? 1 : 0)), debounceTime(50)).subscribe(function (res) {
                    _this.setState({ updatar: _this.state.updatar * -1 });
                });
            }
            if (!this._parentStateStream) {
                this.disposeBag = null;
            }
        };
        A.prototype.componentWillUnmount = function () {
            var _a;
            /** unsubscribe and release localReactor */
            (_a = this.disposeBag) === null || _a === void 0 ? void 0 : _a.unsubscribe();
            this.disposeBag = null;
        };
        A.prototype.render = function () {
            return (React.createElement(Component, __assign({}, this.props, { reactor_control: this.nextControls, "updatar$updatar$updatar": this.state.updatar })));
        };
        A.displayName = 'REACTORKIT_REACTIVE_VIEW';
        return A;
    }(React.PureComponent));
    return A;
}
