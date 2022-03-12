import React, { isValidElement, LegacyRef } from "react";
import H from "@here/maps-api-for-javascript";

export interface HMapProps extends React.HTMLAttributes<HTMLDivElement> {
  options: H.Map.Options;
  platform?: H.service.Platform;
  loadingEl?: React.ReactNode;
}

interface HMapState {
  ref: any;
  map: H.Map | null;
}

export default class HMap extends React.Component<HMapProps, HMapState> {
  constructor(props: HMapProps) {
    super(props);
    this.state = {
      ref: React.createRef(),
      map: null,
    };
  }

  intoMap(
    element: HTMLElement,
    layer: H.service.DefaultLayers,
    options: H.Map.Options
  ) {
    return new H.Map(element, layer.vector.normal.map, options);
  }

  addMapEvents(map: H.Map) {
    return new H.mapevents.MapEvents(map);
  }

  addBehavior(events: H.mapevents.MapEvents) {
    return new H.mapevents.Behavior(events);
  }

  useUI(map: H.Map, layer: H.service.DefaultLayers) {
    let ui = H.ui.UI.createDefault(map, layer);
    //ui.getControl("mapsettings")?.setAlignment(H.ui.LayoutAlignment.TOP_RIGHT);
    //ui.getControl("zoom")?.setAlignment(H.ui.LayoutAlignment.TOP_RIGHT);
    //ui.getControl("scalebar")?.setAlignment(H.ui.LayoutAlignment.TOP_RIGHT);
    return ui;
  }

  componentDidMount() {
    if (!this.state.map && this.props.platform) {
      const { platform, options } = this.props;
      let layer = platform.createDefaultLayers();
      let _map = this.intoMap(this.state.ref?.current, layer, options);
      window.addEventListener("resize", () => _map.getViewPort().resize());
      this.addBehavior(this.addMapEvents(_map));
      this.useUI(_map, layer);
      this.setState({
        map: _map,
      });
    }
  }

  getChildren() {
    let { children } = this.props;
    return React.Children.map(children, (child) => {
      if (isValidElement(child)) {
        return React.cloneElement(child, {
          map: this.state.map,
          platform: this.props.platform,
        });
      } else {
        return null;
      }
    });
  }
  createLoadingComponent() {
    return <div>Loading</div>;
  }

  render(): React.ReactNode {
    const loading = this.props.loadingEl || this.createLoadingComponent();
    return (
      <div id="mapContainer" ref={this.state.ref} {...this.props}>
        {typeof H === "undefined" && loading}
        {typeof H === "object" && this.state.map && this.getChildren()}
      </div>
    );
  }
}
