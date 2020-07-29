import { ReactorControlProps } from "./";
import { ComponentClass } from "react";
import { DisposeBag } from "./";
import React from "react";
import { debounceTime,  map, skip } from "rxjs/operators";
import { deepDistinctUntilChanged } from "./RxjsExtension";
import { Observable } from "rxjs";

/**
 * 
 * @param Component State변경을 구독받을 컴포넌트.
 * @param parentFilterMapper State 변경중에 특정 변경만 구독하도록 함.
 * @param transfromStateStreamFromThisComponent Children 컴포넌트에 맵핑 유지.
 * @param skipSync 리액터의 initial 업데이트를 방지 여부. 로드시 필요없는 랜더링을 방지함.
 */
export default function withReactor<
Action = any, 
State = any,
P = {}, // original props
>(
    Component: ComponentClass<P & ReactorControlProps<Action,State>>, parentFilterMapper?:(state: State) => Partial<State>, transfromStateStreamFromThisComponent : boolean = true, skipSync : boolean = true
) : React.ComponentClass<P & ReactorControlProps<Action,State>> {
    class A extends React.PureComponent<P & ReactorControlProps<Action,State>, {updatar:number}> {

        static displayName = 'REACTORKIT_REACTIVE_VIEW';
        disposeBag: DisposeBag | null = null;

        private _parentStateStream?: Observable<State>; 
        private nextControls? : ReactorControlProps<Action, State>;

        constructor(props:P & ReactorControlProps<Action,State>) {
            super(props)
            if (Component.displayName === "REACTORKIT_GLOBAL") {
                console.error("ERROR : GLOBAL SHOULD BE MOST OUTSIDE OF COMPONENT")
            }
            this.state = { updatar : 1 }
        }

        UNSAFE_componentWillMount(){       

            this.disposeBag = new DisposeBag();

            function customMapper(filterMapper?: (state: State) => any) {
                if (filterMapper) {
                    return map(filterMapper)
                } else {
                    return map<State,State>( value => value )
                }
            }

            if (this.props.reactor_control) {
                this._parentStateStream = this.props.reactor_control.stateStream
                let newReactorControl = {...this.props.reactor_control}
                if (transfromStateStreamFromThisComponent && parentFilterMapper) {
                    newReactorControl!.stateStream = this.props.reactor_control.stateStream.pipe(customMapper(parentFilterMapper))
                    this.nextControls = { reactor_control : newReactorControl }
                } else {
                    this.nextControls = { reactor_control : newReactorControl }
                }
            }

            if (this._parentStateStream) {

                this.disposeBag!.disposeOf = this._parentStateStream!.pipe(
                    customMapper(parentFilterMapper),
                    deepDistinctUntilChanged(), 
                    skip((skipSync? 1 : 0)),
                    debounceTime(50), 
                ).subscribe( 
                    res => {
                        this.setState({updatar : this.state.updatar * -1})  
                    }
                )
            }

            if (!this._parentStateStream) {
                this.disposeBag = null;
            }
        }


        componentWillUnmount(){
            /** unsubscribe and release localReactor */
            this.disposeBag?.unsubscribe();
            this.disposeBag = null;

        }

        render(){
            return( <Component {...this.props} reactor_control={this.nextControls} updatar$updatar$updatar={this.state.updatar}></Component>)
        }
    }
    return A;
} 
