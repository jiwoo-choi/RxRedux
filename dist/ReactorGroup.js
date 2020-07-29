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
function map(children, func) {
    var index = 0;
    return React.Children.map(children, function (child) {
        return React.isValidElement(child) ? func(child, index++, React.Children.count(children)) : child;
    });
}
var ReactorGroup = /** @class */ (function (_super) {
    __extends(ReactorGroup, _super);
    function ReactorGroup() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ReactorGroup.prototype.render = function () {
        var _this = this;
        return (React.createElement(React.Fragment, null, map(this.props.children, function (child, index, total) {
            return React.cloneElement(child, __assign(__assign({}, _this.props), child.props));
        })));
    };
    return ReactorGroup;
}(React.PureComponent));
export default ReactorGroup;
