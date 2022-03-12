export {};
// import H from "@here/maps-api-for-javascript";
// import React from "react";
// import { useEffect, useState } from "react";

// export interface HMapPolygonProps {
//   points: Array<number>; //| H.geo.LineString | H.geo.Polygon | H.geo.MultiPolygon;
//   options?: H.map.Polygon.Options;
//   map?: H.Map;
// }

// interface HPolygonState {
//   lineString: H.geo.LineString;
//   geoPolygon: H.geo.Polygon;
//   mapPolygon: H.map.Polygon;
//   polygonTimeout: NodeJS.Timeout | null;
//   verticeGroup: H.map.Group;
//   mainGroup: H.map.Group;
// }

// export default class HPolygon extends React.Component<
//   HMapPolygonProps,
//   HPolygonState
// > {
//   componentDidMount() {}

//   render(): React.ReactNode {
//     return <></>;
//   }
// }

// // export default function HPolygon(props: HMapPolygonProps) {
// //   const { map, points, options } = props;
// //   if (!H || !H.map || !map) {
// //     throw new Error("HMap has to be initialized before adding Map Objects");
// //   }

// //   const [lineString, setLineString] = useState<H.geo.LineString>();
// //   const [geo, setGeo] = useState<H.geo.Polygon>();
// //   const [polygon, setPolygon] = useState<H.map.Polygon>();
// //   const [polygonTimeout, setPolygonTimeout] = useState<NodeJS.Timeout>();

// //   const [verticeGroup] = useState<H.map.Group>(
// //     new H.map.Group({
// //       data: null,
// //       visibility: false,
// //     })
// //   );
// //   const [mainGroup, setMainGroup] = useState<H.map.Group>();

// //   useEffect(() => {
// //     setLineString(new H.geo.LineString(points));
// //   }, [points]);

// //   useEffect(() => {
// //     if (lineString) {
// //       setGeo(new H.geo.Polygon(lineString));
// //     }
// //   }, [lineString]);

// //   useEffect(() => {
// //     if (geo) {
// //       setPolygon(new H.map.Polygon(geo, options));
// //     }
// //   }, [geo, options]);

// //   useEffect(() => {
// //     if (polygon && verticeGroup) {
// //       setMainGroup(
// //         new H.map.Group({
// //           data: null,
// //           volatility: true,
// //           objects: [polygon, verticeGroup],
// //         })
// //       );
// //     }
// //   }, [polygon, verticeGroup]);

// //   useEffect(() => {
// //     if (mainGroup) {
// //       var svgCircle =
// //         '<svg width="20" height="20" version="1.1" xmlns="http://www.w3.org/2000/svg">' +
// //         '<circle cx="10" cy="10" r="7" fill="transparent" stroke="red" stroke-width="4"/>' +
// //         "</svg>";

// //       var geometry = polygon?.getGeometry();
// //       if (geometry instanceof H.geo.Polygon) {
// //         geometry.getExterior()?.eachLatLngAlt((lat, lng, alt, index) => {
// //           var vertice = new H.map.Marker(new H.geo.Point(lat, lng, alt), {
// //             data: null,
// //             icon: new H.map.Icon(svgCircle, { anchor: { x: 10, y: 10 } }),
// //           });
// //           vertice.setZIndex(index);
// //           verticeGroup?.addObject(vertice);
// //         });
// //         map?.addObject(mainGroup);
// //       }
// //       mainGroup.addEventListener(
// //         "pointerenter",
// //         () => {
// //           if (polygonTimeout) {
// //             clearTimeout(polygonTimeout);
// //             setPolygonTimeout(undefined);
// //           }
// //           verticeGroup?.setVisibility(true);
// //         },
// //         true
// //       );
// //       mainGroup.addEventListener(
// //         "pointerleave",
// //         function (evt: H.mapevents.Event) {
// //           var timeout = evt.currentPointer.type === "touch" ? 1000 : 0;
// //           setPolygonTimeout(() =>
// //             setTimeout(() => verticeGroup?.setVisibility(false), timeout)
// //           );
// //         },
// //         true
// //       );

// //       //-------

// //       // event listener for vertice markers group to change the cursor to pointer
// //       verticeGroup?.addEventListener(
// //         "pointerenter",
// //         function (evt: H.mapevents.Event) {
// //           document.body.style.cursor = "pointer";
// //         },
// //         true
// //       );

// //       // event listener for vertice markers group to change the cursor to default
// //       verticeGroup?.addEventListener(
// //         "pointerleave",
// //         function (evt: H.mapevents.Event) {
// //           document.body.style.cursor = "default";
// //         },
// //         true
// //       );

// //       // event listener for vertice markers group to resize the geo polygon object if dragging over markers
// //       verticeGroup?.addEventListener(
// //         "drag",
// //         function (evt: H.mapevents.Event) {
// //           if (evt.target instanceof H.map.Marker) {
// //             var pointer = evt.currentPointer,
// //               geoLineString = geo?.getExterior(),
// //               geoPoint = map.screenToGeo(pointer.viewportX, pointer.viewportY);
// //             if (geoLineString) {
// //               // set new position for vertice marker
// //               evt.target?.setGeometry(geoPoint);

// //               // set new position for polygon's vertice
// //               geoLineString?.removePoint(evt.target.getData()["verticeIndex"]);
// //               geoLineString?.insertPoint(
// //                 evt.target.getData()["verticeIndex"],
// //                 geoPoint
// //               );
// //               polygon?.setGeometry(new H.geo.Polygon(geoLineString));

// //               // stop propagating the drag event, so the map doesn't move
// //               evt.stopPropagation();
// //             }
// //           }
// //         },
// //         true
// //       );
// //     }
// //   }, [mainGroup]);

// //   return <></>;
// // }
