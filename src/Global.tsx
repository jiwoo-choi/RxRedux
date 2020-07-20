
import React from "react";
import {  GlobalReactor,  GlobalReactorType } from "./GlobalStore";
import { Reactor } from "./Reactor";
import { DisposeBag } from "./DisposeBag";

interface GlobalReactorProps<R,S>{
    globalRactor: R;
    globalState : S;
}
//React.ComponentClass<Exclude<P , GlobalReactorProps<R,S>>> 
export default function Global< 
    R extends Reactor<any,S,any>, //reactor
    S, // global-state
    P={} //olriginal props,
> ( 
    Component: React.ComponentClass<P & GlobalReactorProps<R,S>,any>, key: string
    ) : React.ComponentClass<Omit<P, keyof GlobalReactorProps<R,S>>, GlobalReactorProps<R,S>> {
        return class extends React.Component<Omit<P, keyof GlobalReactorProps<R,S>>, GlobalReactorProps<R,S>> {
            
            static contextType = GlobalReactor;
            private disposeBag?: DisposeBag;
            constructor(props : Omit<P, keyof GlobalReactorProps<R,S>>, context:GlobalReactorType){
                super(props, context)
                let a = this.context as GlobalReactorType;
                let b = a[key]
                let c = b.currentState;
                this.state = {
                    globalRactor : b as R,
                    globalState : c,
                }
            }
            componentDidMount(){
                this.disposeBag = new DisposeBag();
                this.disposeBag.disposeOf = this.state.globalRactor.state.subscribe( res => this.setState({globalState : res}))
            }
            componentWillMount(){
                this.disposeBag?.unsubscribe();
            }
            render(){
                return <Component {...this.props as P} {...this.state as GlobalReactorProps<R,S>}></Component>
            }
        }
 }
