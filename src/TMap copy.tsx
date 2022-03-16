// import React, { PropsWithChildren, useEffect } from "react";
// import { useState } from "react";
// import H, { ui } from "@here/maps-api-for-javascript";
// import moment from "moment";
// import { IRequest } from "./App";

// export interface Itemplate {
//   id: string;
//   name: string;
//   address: string;
//   st: string;
//   at: string;
//   acc: string;
//   beforeId: string;
// }

// export interface IData extends Itemplate {
//   location: string;
//   destination: string;
//   constraints: string;
//   sequence: number;
//   arrival: string;
//   departure: string;
//   stay?: number;
//   marker?: H.map.Marker;
//   filter: boolean;
// }

// interface TMapProps {
//   data: IData[];
//   calculate: IRequest;
// }

// export default function TMap(props: TMapProps) {
//   const { data, calculate } = props;
//   const ref = React.createRef<HTMLDivElement>();
//   const [platform] = useState(
//     new H.service.Platform({
//       apikey: "BXkE_sgUvewFFWfZOu1jewbPIibBLsH4XrQgGfv0Zho",
//     })
//   );

//   const [geocoder, setGeocoder] = useState<H.service.GeocodingService>();
//   const [routeService, setRtoueService] = useState<H.service.RoutingService8>();
//   const [layers, setLayers] = useState<H.service.DefaultLayers>();
//   const [map, setMap] = useState<H.Map>();
//   const [ui, setUI] = useState<H.ui.UI>();

//   useEffect(() => {
//     if (platform && ref.current) {
//       let _leyers = platform.createDefaultLayers();
//       setLayers(_leyers);
//       let _map = new H.Map(ref.current, _leyers.vector.normal.map, {
//         zoom: 11,
//         center: {
//           lat: 37.38759,
//           lng: -121.88367,
//         },
//       });
//       setMap(_map);
//       let ui = H.ui.UI.createDefault(_map, _leyers);
//       let events = new H.mapevents.MapEvents(_map);
//       let behavior = new H.mapevents.Behavior(events);
//       setGeocoder(platform.getGeocodingService());
//       setRtoueService(platform.getRoutingService(undefined, 8));
//       setUI(ui);
//     }
//   }, []);

//   useEffect(() => {
//     if (geocoder) {
//       data.map((m) => geocoding(m));
//     }
//   }, [data, geocoder, geocoding]);

//   useEffect(() => {
//     routeService?.calculateRoute(
//       {
//         origin: "",
//         destination: "",
//         via: new H.service.Url.MultiValueQueryParameter([1, 2, 3, 4, 5]),
//         return: "polyline",
//       },
//       () => {},
//       () => {}
//     );

//     if (calculate.start !== null && calculate.end !== null) {
//       data
//         .filter(
//           (f) => f.id === calculate.start?.id || f.id === calculate.end?.id
//         )
//         .forEach((e) => (e.filter = true));

//       if (calculate.func === "route") {
//         getRequest(
//           "https://router.hereapi.com/v8/routes?apiKey=BXkE_sgUvewFFWfZOu1jewbPIibBLsH4XrQgGfv0Zho",
//           (response: any) => sectionsHandle(response)
//         );
//       }
//     }
//   }, [calculate, data]);

//   function getRequest(url: string, callback: Function) {
//     var xhr = new XMLHttpRequest();
//     xhr.addEventListener("load", () => {
//       const response = JSON.parse(xhr.responseText);
//       callback(response);
//     });
//     xhr.open("GET", url);
//     xhr.send();
//   }

//   const waypointsHandle = (response: any) => {};

//   const sectionsHandle = (response: any) => {
//     response.routes[0].sections.forEach((section: any) => {
//       let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);
//       if (linestring) {
//         var routeLine = new H.map.Group();
//         routeLine.addObjects([getOutline(linestring), getArrows(linestring)]);
//         map?.addObject(routeLine);
//       }
//     });
//   };

//   function getAcc(tws: string[]) {
//     var str = tws
//       .filter((f) => f.split(":").length >= 2)
//       .map((t) => {
//         var array = t.split(":");
//         var hour = parseInt(array[0]);
//         var minu = parseInt(array[1]);
//         var today = new Date();
//         today.setHours(hour);
//         today.setMinutes(minu);
//         return moment(today).format("ddHH:mm:ssZ");
//       });
//     var result = `acc:${str.join("|")}`;
//     console.log(result);

//     return result;
//   }

//   function geocoding(item: IData) {
//     geocoder?.geocode(
//       { searchText: item.address },
//       (result: any) => {
//         let position =
//           result.Response.View[0].Result[0].Location.DisplayPosition;
//         let location = {
//           lat: position.Latitude,
//           lng: position.Longitude,
//         };
//         var marker = new H.map.Marker(location, {
//           data: null,
//           icon: dotIcon(item.id),
//         });

//         marker.addEventListener(
//           "tap",
//           function (evt: any) {
//             var bubble = new H.ui.InfoBubble(evt.target.getGeometry(), {
//               content: `<sapn>${item.name}</sapn>`,
//             });
//             ui?.addBubble(bubble);
//           },
//           false
//         );
//         map?.addObject(marker);
//         item.location = `${position.Latitude},${position.Longitude}`;
//         item.marker = marker;
//       },
//       (error: Error) => {
//         console.log(error);
//       }
//     );
//     return item;
//   }

//   function getDestinations() {
//     data
//       //.filter((m) => m.id !== calculate.start?.id && m.id !== calculate.end?.id)
//       .filter((m) => !m.filter)
//       .forEach((m, i) => {
//         m.destination = `destination${i}`;
//         if (m.st) m.constraints = `${m.constraints};st=${m.st}`;
//         if (m.acc) m.constraints = `${m.constraints};acc=${m.acc}`;
//         if (m.at) m.constraints = `${m.constraints};at=${m.at}`;
//       });
//     data
//       .filter((f) => f.beforeId !== "")
//       .forEach((m) => {
//         var bf = data.find((x) => x.id === m.beforeId);
//         if (bf) {
//           m.constraints = m.constraints + `;before:${bf.destination}`;
//         }
//       });

//     return (
//       data
//         //.filter((m) => m.id !== calculate.start?.id && m.id !== calculate.end?.id)
//         .filter((m) => !m.filter)
//         .map((m) => `&${m.destination}=${m.id};${m.location};${m.constraints}`)
//         .join("")
//     );
//   }

//   function findsequence2(start?: IData, end?: IData) {
//     if (start && end) {
//       start.marker?.setIcon(dotIcon("S"));
//       end.marker?.setIcon(dotIcon("E"));

//       var baseurl =
//         "https://wps.hereapi.com/v8/findsequence2?apiKey=BXkE_sgUvewFFWfZOu1jewbPIibBLsH4XrQgGfv0Zho" +
//         "&mode=balanced;truck;traffic:disabled;&improveFor=distance" +
//         `&departure=${moment().format("YYYY-MM-DDTHH:mm:ssZ")}` +
//         `&start=${start?.location}&end=${end?.location}` +
//         getDestinations();

//       var xhr = new XMLHttpRequest();
//       xhr.addEventListener("load", () => {
//         const response = JSON.parse(xhr.responseText);
//         const waypoints = response.results[0].waypoints;
//         console.log("findsequence2:", waypoints);

//         waypoints.forEach((wp: any) => {
//           if (wp.id === "start") {
//             start!.sequence = wp.sequence;
//             start!.arrival = moment(wp.estimatedArrival).toNow();
//             start!.departure = moment(wp.estimatedDeparture).toNow();
//           } else if (wp.id === "end") {
//             end!.sequence = wp.sequence;
//             end!.arrival = moment(wp.estimatedArrival).toNow();
//             end!.departure = moment(wp.estimatedDeparture).toNow();
//           } else {
//             var mk = data.find((x) => x.id === wp.id);
//             if (mk) {
//               mk.sequence = wp.sequence;
//               mk.marker?.setIcon(dotIcon(wp.sequence, "#f44336"));
//               mk.arrival = moment(wp.estimatedArrival).toNow();
//               mk.departure = moment(wp.estimatedDeparture).toNow();
//             } else {
//               throw new Error("miss some marker");
//             }
//           }
//         });

//         // interconnections.forEach((element: any) => {
//         //   var s = data.find((x) => (x.id = element.fromWaypoint));
//         //   var e = data.find((x) => x.id === element.toWaypoint);
//         //   routev8(s, e);
//         // });
//       });

//       xhr.open("GET", baseurl);
//       xhr.send();
//     }
//   }

//   function getVia(start?: IData, end?: IData) {
//     return data
//       .filter((f) => f !== start && f !== end)
//       .sort((s) => s.sequence!)
//       .map((m) => `&via=${m.location}`)
//       .join("");
//   }

//   function routev8(start?: IData, end?: IData) {
//     var baseUrl =
//       `https://router.hereapi.com/v8/routes?apiKey=BXkE_sgUvewFFWfZOu1jewbPIibBLsH4XrQgGfv0Zho` +
//       `&return=polyline` +
//       `&transportMode=car` +
//       `&origin=${start?.location}&destination=${end?.location}` +
//       getVia();

//     var xhr = new XMLHttpRequest();
//     xhr.addEventListener("load", () => {
//       const response = JSON.parse(xhr.responseText);
//       console.log("routes:", response);
//       var route = response.routes[0];
//       route.sections.forEach((section: any) => {
//         let linestring = H.geo.LineString.fromFlexiblePolyline(
//           section.polyline
//         );
//         if (linestring) {
//           var routeLine = new H.map.Group();
//           routeLine.addObjects([getOutline(linestring), getArrows(linestring)]);
//           //routeLine.addObject(getOutline(linestring));
//           map?.addObject(routeLine);
//         }
//       });
//     });
//     xhr.open("GET", baseUrl);
//     xhr.send();
//   }

//   const getOutline = (linestring: H.geo.LineString) =>
//     new H.map.Polyline(linestring, {
//       data: null,
//       style: {
//         lineWidth: 4,
//         strokeColor: "rgba(2, 119, 189, 1)", //"rgba(0, 128, 255, 0.7)",
//         lineTailCap: "arrow-tail",
//         lineHeadCap: "arrow-head",
//       },
//     });

//   const getArrows = (linestring: H.geo.LineString) =>
//     new H.map.Polyline(linestring, {
//       data: null,
//       style: {
//         lineWidth: 8,
//         fillColor: "white",
//         strokeColor: "white",
//         lineDash: [0, 15],
//         lineTailCap: "arrow-tail",
//         lineHeadCap: "arrow-head",
//       },
//     });

//   var dotIcon = (index?: number | string, fill?: string) => {
//     //
//     const text =
//       index === undefined
//         ? null
//         : '<text text-anchor="middle" x="50%" y="50%" font-size="8px" fill="white" dy=".3em" >' +
//           index +
//           "</text>";
//     return new H.map.Icon(
//       '<svg width="18" height="18" xmlns="http://www.w3.org/2000/svg"> ' +
//         `<circle cx="9" cy="9" r="9" fill="${
//           fill ?? "#9e9e9e"
//         }" stroke="white" stroke-width="1" />` +
//         text +
//         "</svg>",
//       {
//         anchor: { x: 8, y: 8 },
//       }
//     );
//   };

//   return <div id="mapContainer" ref={ref} style={{ height: 800 }} />;
// }
export {};
