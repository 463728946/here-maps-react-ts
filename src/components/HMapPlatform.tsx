import React, { isValidElement } from "react";
import H from "@here/maps-api-for-javascript";

export interface HMapPlatformProps extends H.service.Platform.Options {
  children: React.ReactNode;
}

interface HMapPlatformState {
  platform: H.service.Platform | null;
}

export default class HMapPlatform extends React.Component<
  HMapPlatformProps,
  HMapPlatformState
> {
  constructor(props: HMapPlatformProps) {
    super(props);
    this.state = {
      platform: null,
    };
  }

  componentDidMount(): void {
    this.setState({
      platform: new H.service.Platform(this.props), //是否可以直接在17行？
    });
  }

  getChildren() {
    let { children } = this.props;
    return (
      <div id="platform">
        {React.Children.map(children, (child) => {
          if (isValidElement(child)) {
            return React.cloneElement(child, { platform: this.state.platform });
          } else {
            return null;
          }
        })}
      </div>
    );
  }

  render(): React.ReactNode {
    return this.state.platform ? this.getChildren() : null;
  }
}
