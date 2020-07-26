import { Observable, of, empty , MonoTypeOperatorFunction  } from "rxjs";
import { catchError,  distinctUntilChanged, takeUntil, filter } from "rxjs/operators";
import _ from 'lodash'

export function catchErrorJustReturn<T>(value: T): MonoTypeOperatorFunction<T> {
    return catchError( err => of(value) )
}

export function catchErrorReturnEmpty<T>() {
    return catchError( err => empty() )
}

export function deepDistinctUntilChanged() {
    return distinctUntilChanged(_.isEqual)
}