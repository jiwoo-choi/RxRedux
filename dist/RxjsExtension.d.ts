import { MonoTypeOperatorFunction } from "rxjs";
export declare function catchErrorJustReturn<T>(value: T): MonoTypeOperatorFunction<T>;
export declare function catchErrorReturnEmpty<T>(): import("rxjs").OperatorFunction<unknown, unknown>;
export declare function deepDistinctUntilChanged(): MonoTypeOperatorFunction<any>;
