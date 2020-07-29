import { ReactorControlProps } from "./";
import { ComponentClass } from "react";
import React from "react";
/**
 *
 * @param Component State변경을 구독받을 컴포넌트.
 * @param parentFilterMapper State 변경중에 특정 변경만 구독하도록 함.
 * @param transfromStateStreamFromThisComponent Children 컴포넌트에 맵핑 유지.
 * @param skipSync 리액터의 initial 업데이트를 방지 여부. 로드시 필요없는 랜더링을 방지함.
 */
export default function withReactor<Action = any, State = any, P = {}>(Component: ComponentClass<P & ReactorControlProps<Action, State>>, parentFilterMapper?: (state: State) => Partial<State>, transfromStateStreamFromThisComponent?: boolean, skipSync?: boolean): React.ComponentClass<P & ReactorControlProps<Action, State>>;
