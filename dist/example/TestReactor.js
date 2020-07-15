"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DECREASE = exports.INCREASE = void 0;
const Reactor_1 = require("../Reactor");
const rxjs_1 = require("rxjs");
exports.INCREASE = 'INCREASE';
exports.DECREASE = 'DECREASE';
class TestReactor extends Reactor_1.default {
    mutate(action) {
        switch (action.type) {
            case "INCREASE":
                return rxjs_1.of(action);
            case "DECREASE":
                return rxjs_1.of(action);
        }
    }
    reduce(state, mutation) {
        let newState = state;
        switch (mutation.type) {
            case "INCREASE":
                newState.value = newState.value + 1;
                return newState;
            case "DECREASE":
                newState.value = newState.value - 1;
                return newState;
        }
    }
}
exports.default = TestReactor;
