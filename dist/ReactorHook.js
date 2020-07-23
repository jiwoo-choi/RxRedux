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
import { Reactor } from "./";
import { useState } from "react";
import { tap } from "rxjs/operators";
var ReactorHook = /** @class */ (function (_super) {
    __extends(ReactorHook, _super);
    function ReactorHook() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ReactorHook.flush = function () {
        ReactorHook.setState(ReactorHook.updator *= -1);
    };
    ReactorHook.use = function (initialState, isStubEnabled, isGlobal) {
        if (isStubEnabled === void 0) { isStubEnabled = false; }
        if (isGlobal === void 0) { isGlobal = false; }
        ReactorHook.setState = useState(1)[1];
        var _a = useState(undefined), state = _a[0], setState = _a[1];
        if (!state) {
            var self_1 = new this(initialState, isStubEnabled, isGlobal);
            setState(self_1);
        }
        var currentState = (!state) ? initialState : state.currentState;
        return [state, currentState];
    };
    ReactorHook.prototype.transformState = function (state) {
        return state.pipe(tap(function () { return ReactorHook.flush(); }));
    };
    ReactorHook.updator = 1;
    return ReactorHook;
}(Reactor));
export default ReactorHook;
