import React from "react";
export interface ReactorGroupProps<T = any> {
    reactor?: T;
}
export default class ReactorGroup extends React.PureComponent<ReactorGroupProps> {
    render(): JSX.Element;
}
