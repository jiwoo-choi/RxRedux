import { of, empty } from "rxjs";
import { catchError, distinctUntilChanged } from "rxjs/operators";
import _ from 'lodash';
export function catchErrorJustReturn(value) {
    return catchError(function (err) { return of(value); });
}
export function catchErrorReturnEmpty() {
    return catchError(function (err) { return empty(); });
}
export function deepDistinctUntilChanged() {
    return distinctUntilChanged(_.isEqual);
}
