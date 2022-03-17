import React, { useEffect, useImperativeHandle } from "react";
import { useState } from "react";
import H from "@here/maps-api-for-javascript";
import moment from "moment";
import { IRequest } from "./App";
import { Grid, List, ListItem, ListItemText } from "@mui/material";

interface ILog {
  distance: number;
  time: number;
}

export interface Itemplate {
  id: string;
  name: string;
  address: string;
  st: string;
  at: string;
  acc: string;
  beforeId: string;
}

export interface IData extends Itemplate {
  location: string;
  destination: string;
  constraints: string;
  sequence: number;
  arrival: string;
  departure: string;
  stay?: number;
  marker?: H.map.Marker;
}

export interface IRUN {
  run(): void;
}

interface TMapProps {
  config: IRequest;
  table: IData[];
}

const TMap = React.forwardRef((props: TMapProps, ref: any) => {
  const { config, table } = props;
  const mapRef = React.createRef<HTMLDivElement>();
  const platform = new H.service.Platform({
    apikey: "BXkE_sgUvewFFWfZOu1jewbPIibBLsH4XrQgGfv0Zho",
  });
  const [geocoder, setGeocoder] = useState<H.service.GeocodingService>();
  const [routeService, setRtoueService] = useState<H.service.RoutingService8>();
  const [layers, setLayers] = useState<H.service.DefaultLayers>();
  const [map, setMap] = useState<H.Map>();
  const [ui, setUI] = useState<H.ui.UI>();
  const [log, setLog] = useState<ILog>({
    distance: 0,
    time: 0,
  });

  useEffect(() => {
    if (platform && mapRef.current) {
      let _leyers = platform.createDefaultLayers();
      setLayers(_leyers);
      let _map = new H.Map(mapRef.current, _leyers.vector.normal.map, {
        zoom: 11,
        center: {
          lat: 37.38759,
          lng: -121.88367,
        },
      });
      setMap(_map);
      let ui = H.ui.UI.createDefault(_map, _leyers);
      let events = new H.mapevents.MapEvents(_map);
      let behavior = new H.mapevents.Behavior(events);
      setGeocoder(platform.getGeocodingService());
      setRtoueService(platform.getRoutingService(undefined, 8));
      setUI(ui);
    }
  }, []);

  useEffect(() => {
    table.forEach((item) => geocode(item));
  }, [table]);

  useImperativeHandle(ref, () => ({
    run: () => {
      if (config.start !== null && config.end !== null && table.length > 0) {
        if (config.func === "find") {
          findsequence2(config.start, config.end);
        } else {
          routev8(config.start, config.end);
        }
      }
    },
  }));

  function geocode(item: IData) {
    geocoder?.geocode(
      { searchText: item.address },
      (result: any) => {
        let position =
          result.Response.View[0].Result[0].Location.DisplayPosition;
        let location = {
          lat: position.Latitude,
          lng: position.Longitude,
        };
        var marker = new H.map.Marker(location, {
          data: null,
          icon: dotIcon(item.id),
        });

        marker.addEventListener(
          "tap",
          function (evt: any) {
            var bubble = new H.ui.InfoBubble(evt.target.getGeometry(), {
              content: `<sapn>${item.name}</sapn>`,
            });
            ui?.addBubble(bubble);
          },
          false
        );
        map?.addObject(marker);
        item.location = `${position.Latitude},${position.Longitude}`;
        item.marker = marker;
      },
      (error: Error) => {
        console.log(error);
      }
    );
  }

  function findsequence2(start: IData, end: IData) {
    start.marker?.setIcon(dotIcon("S"));
    end.marker?.setIcon(dotIcon("E"));

    var baseurl =
      "https://wps.hereapi.com/v8/findsequence2?apiKey=BXkE_sgUvewFFWfZOu1jewbPIibBLsH4XrQgGfv0Zho" +
      `&mode=${config.mode.routingMode};${config.mode.transportMode};traffic:${config.mode.traffic};` +
      `&departure=${moment().format("YYYY-MM-DDTHH:mm:ssZ")}` +
      `&start=${start.location}&end=${end.location}` +
      getDestinations(start, end);

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", () => {
      const response = JSON.parse(xhr.responseText);
      const waypoints = response.results[0].waypoints;
      //var lineString = new H.geo.LineString();
      waypoints.forEach((wp: any) => {
        if (wp.id === "start") {
          start!.sequence = wp.sequence;
          start!.arrival = moment(wp.estimatedArrival).toNow();
          start!.departure = moment(wp.estimatedDeparture).toNow();
        } else if (wp.id === "end") {
          end!.sequence = wp.sequence;
          end!.arrival = moment(wp.estimatedArrival).toNow();
          end!.departure = moment(wp.estimatedDeparture).toNow();
        } else {
          var mk = table.find((x) => x.id === wp.id);
          if (mk) {
            mk.sequence = wp.sequence;
            mk.marker?.setIcon(dotIcon(wp.sequence, "#f44336"));
            mk.arrival = moment(wp.estimatedArrival).toNow();
            mk.departure = moment(wp.estimatedDeparture).toNow();
          } else {
            throw new Error("miss some marker");
          }
        }
        //lineString.pushLatLngAlt(wp.lat, wp.lng, undefined);
      });
      setLog({
        distance: Number(response.results[0].distance),
        time: Number(response.results[0].time),
      });
    });

    xhr.open("GET", baseurl);
    xhr.send();
  }
  function getDestinations(start: IData, end: IData) {
    table
      .filter((m) => m.id !== start.id && m.id !== end.id)
      .forEach((m, i) => {
        m.destination = `destination${i}`;
        m.constraints = "";
        if (m.st) m.constraints += `st:${m.st};`;
        if (m.acc) m.constraints += `acc:${m.acc};`;
        if (m.at) m.constraints += `at:${m.at};`;
      });
    table
      .filter((f) => f.beforeId !== "")
      .forEach((m) => {
        var beforeValue = "";
        var ids = m.beforeId.split(",");
        ids.forEach((fid) => {
          var bf = table.find((x) => x.id === fid);
          if (bf) {
            beforeValue =
              beforeValue === ""
                ? `${bf.destination}`
                : `${beforeValue},${bf.destination}`;
          }
        });
        m.constraints += `before:${beforeValue};`;
      });
    return table
      .filter((m) => m.id !== start.id && m.id !== end.id)
      .map((m) => `&${m.destination}=${m.id};${m.location};${m.constraints}`)
      .join("");
  }

  function routev8(start: IData, end: IData) {
    let via =
      config.func === "find"
        ? ""
        : table
            .filter((f) => f.id !== start.id && f.id !== end.id)
            .map((m) => `&via=${m.location}`)
            .join("");
    var baseUrl =
      `https://router.hereapi.com/v8/routes?apiKey=BXkE_sgUvewFFWfZOu1jewbPIibBLsH4XrQgGfv0Zho` +
      `&return=polyline,summary` +
      `&routingMode=${
        config.mode.routingMode === "balanced"
          ? "fast"
          : config.mode.routingMode === "fastest"
          ? "fast"
          : config.mode.routingMode === "shortest"
          ? "short"
          : config.mode.routingMode
      }` +
      `&transportMode=${config.mode.transportMode}` +
      `&origin=${start.location}&destination=${end.location}${via}`;

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", () => {
      const response = JSON.parse(xhr.responseText);
      console.log("routes:", response);
      var route = response.routes[0];
      var d = 0,
        l = 0;
      route.sections.forEach((section: any) => {
        console.log(
          "id:",
          section.departure.place.waypoint,
          "duration:",
          section.summary.duration,
          "length:",
          section.summary.length
        );

        d += section.summary.duration;
        l += section.summary.length;
        let linestring = H.geo.LineString.fromFlexiblePolyline(
          section.polyline
        );
        if (linestring) {
          var routeLine = new H.map.Group();
          routeLine.addObjects([getOutline(linestring), getArrows(linestring)]);
          map?.addObject(routeLine);
        }
      });

      setLog({
        distance: l,
        time: d,
      });
    });
    xhr.open("GET", baseUrl);
    xhr.send();
  }

  const dotIcon = (index?: number | string, fill?: string) => {
    const text =
      index === undefined
        ? null
        : '<text text-anchor="middle" x="50%" y="50%" font-size="8px" fill="white" dy=".3em" >' +
          index +
          "</text>";
    return new H.map.Icon(
      '<svg width="18" height="18" xmlns="http://www.w3.org/2000/svg"> ' +
        `<circle cx="9" cy="9" r="9" fill="${
          fill ?? "#9e9e9e"
        }" stroke="white" stroke-width="1" />` +
        text +
        "</svg>",
      {
        anchor: { x: 8, y: 8 },
      }
    );
  };
  const getOutline = (linestring: H.geo.LineString) =>
    new H.map.Polyline(linestring, {
      data: null,
      arrows: {},
      style: {
        lineWidth: 4,
        strokeColor: `rgba(2, 119, 189, 1)`,
        lineTailCap: "arrow-tail",
        lineHeadCap: "arrow-head",
      },
    });

  const getArrows = (linestring: H.geo.LineString) =>
    new H.map.Polyline(linestring, {
      data: null,
      style: {
        lineWidth: 8,
        fillColor: "white",
        strokeColor: "white",
        lineDash: [0, 5],
        lineTailCap: "arrow-tail",
        lineHeadCap: "arrow-head",
      },
    });

  return (
    <Grid container>
      <Grid item xs={10}>
        <div id="mapContainer" ref={mapRef} style={{ height: 800 }} />
      </Grid>
      <Grid item xs={2}>
        <List>
          <ListItem>
            <ListItemText>{log?.distance / 1000}km</ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText>{log?.time / 60}min</ListItemText>
          </ListItem>
        </List>
      </Grid>
    </Grid>
  );
});

export default TMap;
