import React from "react";
// import { ReactorView } from "./ReactorView";
import { Reactor } from "./";
import { GlobalReactor, GlobalReactorType } from "./GlobalStore";
import ReactiveView, { reactorAccessible, reactorTesterKit } from "./ReactiveView";
import { DisposeBag } from "./";


export interface GlobalReactorProps<R,S>{
    globalReactor: R;
    globalState : S;
}
//React.ComponentClass<Exclude<P , GlobalReactorProps<R,S>>> 
export default function Global< 
    R extends Reactor<any,S,any>, //reactor
    S, //global-state
    P={} //olriginal props,
> ( 
    Component: React.ComponentClass<P & GlobalReactorProps<R,S>,any>, key: string
    ) : React.ComponentClass<Omit<P, keyof GlobalReactorProps<R,S>>, GlobalReactorProps<R,S>> {
        return class extends React.Component<Omit<P, keyof GlobalReactorProps<R,S>>, GlobalReactorProps<R,S>> implements reactorAccessible<R>, reactorTesterKit {

            static displayName = "REACTORKIT_GLOBAL"
            static contextType = GlobalReactor;
            private disposeBag?: DisposeBag;
            private _reactor?: R;
            private _childRef: any ; //why not createRef?

            set reactor(newR : R) {       
                this._reactor = newR;
                this.disposeBag?.unsubscribe();
                this.disposeBag = new DisposeBag();
                this.setState({globalReactor: newR, globalState: newR.currentState}, () => {
                    this.disposeBag!.disposeOf = this.state.globalReactor.state.subscribe( res => this.setState({globalState : res}))
                })
            } 
            

            get childProps(){
                console.log("child props called");
                console.log(Component.displayName);

                if (Component.displayName === "REACTORKIT_REACTIVE_VIEW") {
                    let a = this.childRef as any
                    if (a) {
                        return a.childProps;
                    } else {
                        return undefined;
                    }
                } else {
                    let a = this.childRef as React.Component<any>;
                    return a.props
                }
            }
    
            get childState(){
                if (Component.displayName === "REACTORKIT_REACTIVE_VIEW") {
                    let a = this.childRef as any
                    if (a) {
                        return a.childState;
                    } else {
                        return undefined;
                    }
                } else {
                    let a = this.childRef as React.Component<any>;
                    return a.state
                }
            }
            
            get childRef(){
                if (Component.displayName === "REACTORKIT_REACTIVE_VIEW") {
                    let a = this.childRef as any
                    if (a) {
                        return a.childRef;
                    } else {
                        return undefined;
                    }
                } else {
                    let a = this.childRef as React.Component<any>;
                    return this._childRef;
                }
            }

            set childRef(ref: any){
                this._childRef = ref;
            }

            constructor(props : Omit<P, keyof GlobalReactorProps<R,S>>, context:GlobalReactorType){
                super(props, context)

                let globalContext = this.context as GlobalReactorType;
                this._reactor = globalContext[key] as R

                if (this._reactor) {
                    let state = this._reactor.currentState;
            
                    this.state = {
                        globalReactor : this._reactor,
                        globalState : state,
                    }
                }
            }

            componentDidMount(){
                if (this._reactor) {
                    this.disposeBag = new DisposeBag();
                    this.disposeBag.disposeOf = this.state.globalReactor.state.subscribe( res => this.setState({globalState : res}))
                }
            }

            componentWillUnmount(){
                this.disposeBag?.unsubscribe();
                //테스트해야됨.
            }

            render(){
                return <Component {...this.props as P} {...this.state as GlobalReactorProps<R,S>} ref={ref => this.childRef = ref} ></Component>
            }
        }
 }
