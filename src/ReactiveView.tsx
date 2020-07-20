import { Reactor } from "./Reactor";
import { ComponentClass } from "react";
import { DisposeBag } from "./DisposeBag";
import React from "react";
import { GlobalReactor } from "./GlobalStore";


export interface  ReactorView<P extends Reactor<any,any,any>> {
    reactor?:P;
    bind(reactor:P):DisposeBag;
}

export default function ReactiveView<
R extends Reactor<any,any,any>,
State = any,
P = {},  
>(
    Component: ComponentClass<P,State>
) : React.ComponentClass<P> {
    return class extends React.PureComponent<P> {

        static contextType = GlobalReactor;

        childRef: any ;
        disposeBag?: DisposeBag;
        _reactor?: R;

        set reactor(newR : R) {       
            this._reactor = newR;
            this.disposeBag?.unsubscribe();
            let a = this.childRef as ReactorView<R> 
            this.disposeBag = a.bind(newR);
        }  

        componentDidMount(){
            let view = this.childRef as ReactorView<R> 
            this._reactor = view.reactor;
            if (this._reactor) {
                this.disposeBag = view.bind(this._reactor);
            } else {
                alert('np!');
            }
        }

        componentWillUnmount(){
            if(this.disposeBag) {
                this.disposeBag.unsubscribe();
            }
            this._reactor?.disposeAll();
        }

        render(){
            return( <Component {...this.props} ref={ref => this.childRef = ref}></Component>)
        }
    }


} 