import React from "react";
import { ReactorControlProps } from "./";


function map(children : React.ReactNode, func: (child : React.ReactElement, index?:number, total?: number)=>void) {
    let index = 0;
    return React.Children.map(children, (child) =>
      React.isValidElement(child) ? func(child, index++, React.Children.count(children)) : child,
    );
}

export default class ReactorGroup extends React.PureComponent<ReactorControlProps<any,any>>{
    
    render(){
        return(
            <>
                {
                    map( this.props.children, (child, index, total) => {
                        return React.cloneElement( child , {
                            ...this.props,
                            ...child.props,
                        })
                    })
                }
            </>
        )
    }

}