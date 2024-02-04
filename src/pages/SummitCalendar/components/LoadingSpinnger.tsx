import { createSpinner, showSpinner, hideSpinner } from "@syncfusion/ej2-popups";
import React from "react";

export class LoadingSpinner extends React.Component<{ isLoading: boolean }, Record<string, never>> {
  private element = React.createRef<HTMLDivElement>();

  componentDidMount() {
    if (this.element.current) {
      createSpinner({ target: this.element.current });
      if (this.props.isLoading) {
        showSpinner(this.element.current);
      }
    }
  }

  componentDidUpdate(prevProps: { isLoading: boolean }) {
    if (this.props.isLoading !== prevProps.isLoading) {
      if (this.element.current) {
        if (this.props.isLoading) {
          showSpinner(this.element.current);
        } else {
          hideSpinner(this.element.current);
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.element.current) {
      hideSpinner(this.element.current);
    }
  }

  render() {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div ref={this.element} />
        {this.props.isLoading && "Loading..."}
      </div>
    );
  }
}
