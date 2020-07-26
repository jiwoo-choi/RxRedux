import { Reactor } from "./";
import { ComponentClass } from "react";
import { DisposeBag } from "./";
import React from "react";
import { debounceTime } from "rxjs/operators";

export default function ReactiveView<
P = {},  
>(
    Component: ComponentClass<P>
) : React.ComponentClass<P> {

    class A extends React.PureComponent<P, {updatar:number}> {

        static displayName = 'REACTORKIT_REACTIVE_VIEW';

        private _childRef: any ;
        disposeBag?: DisposeBag;
        private _parentReactor?: Reactor<any,any,any> | null;
        private _localReactor?: Reactor<any,any,any> | null;

        constructor(props:P) {
            super(props)
            if (Component.displayName === "REACTORKIT_GLOBAL") {
                console.error("ERROR : GLOBAL SHOULD BE MOST OUTSIDE OF COMPONENT")
            }
            this.state = { updatar : 1 }
        }

        UNSAFE_componentWillMount(){
            
            /** Check its props whether it has Reactor or not */
            for (const [key, value] of Object.entries(this.props)) {
                if( value ) {
                    if ((value as any).REACTORID$) {
                        this._parentReactor = (value as Reactor<any,any,any>);
                    }
                }
            }
        }


        componentDidMount(){


            this.disposeBag = new DisposeBag();

            /** Check its children whether it has Reactor or not */
            for (const [key, value] of Object.entries(this._childRef)) {
                if (value) {
                    if ((value as any).REACTORID$) {
                        this._localReactor = (value as Reactor<any,any,any>);
                    }
                }
            }

            /** Parent's props's state are  */
            this.disposeBag.disposeOf = this._parentReactor?.state
            .pipe(
                debounceTime(100), // debouncing to avoid frequent vDom updating
            ).subscribe( 
                (res : any) => {
                    this.setState({updatar : this.state.updatar * -1})  
                }
            )
            
            this.disposeBag.disposeOf = this._localReactor?.state
            .subscribe( 
                (res: any) => this.setState({updatar : this.state.updatar * -1})
            )

        }

        componentWillUnmount(){
            /** unsubscribe and release localReactor */
            this.disposeBag?.unsubscribe();
            this._localReactor?.disposeAll();
            this._localReactor = null;
        }

        render(){
            return( <Component {...this.props} ref={ref => this._childRef = ref} updatar={this.state.updatar}></Component>)
        }
    }
    return A;
} 
