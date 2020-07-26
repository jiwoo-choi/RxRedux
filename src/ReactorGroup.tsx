import React from "react";

function map(children : React.ReactNode, func: (child : React.ReactElement, index?:number, total?: number)=>void) {
    let index = 0;
    return React.Children.map(children, (child) =>
      React.isValidElement(child) ? func(child, index++, React.Children.count(children)) : child,
    );
}

export interface ReactorGroupProps<T = any> {
    reactor?: T
}

export default class ReactorGroup extends React.PureComponent<ReactorGroupProps>{

    render(){
        return(
            <>
                {
                    map( this.props.children, (child, index, total) => {
                        return React.cloneElement( child , {
                            ...child.props,
                            reactor:this.props.reactor,
                        })
                    })
                }
            </>
        )
    }

}