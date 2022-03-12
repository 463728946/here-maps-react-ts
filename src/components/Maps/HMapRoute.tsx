export {};
// import H from "@here/maps-api-for-javascript";
// import { useEffect, useState } from "react";

// export interface HMapRouteProps {
//   //position: H.geo.IPoint | H.geo.MultiPoint;
//   data: H.geo.IPoint | string;
//   map?: H.Map;
//   platform?: H.service.Platform;
//   options?: H.map.Marker.Options;
// }

// export default function HMapRoute(props: HMapRouteProps) {
//   const { map, platform, data, options } = props;

//   if (!H) {
//     throw new Error("H has to be initialized before adding Map Objects");
//   }

//   if (!H.map) {
//     throw new Error("H.map has to be initialized before adding Map Objects");
//   }

//   if (!map) {
//     throw new Error("map has to be initialized before adding Map Objects");
//   }

//   useEffect(() => {
//     if (typeof data === "string") {
//       var service = platform?.getRoutingService(undefined, 8);
//       var obj = map.getObjects();
//       console.log(obj);

//       var routeParams = {
//           wroutingMode: "fast",
//           transportMode: "car",
//           origin: "52.5160,13.3779",
//           destination: "52.5206,13.3862",
//           return:
//             "polyline,turnByTurnActions,actions,instructions,travelSummary",
//         },
//         onResult = function (result: any) {
//           let route = result.routes[0];
//           console.log(result);
//           var group = new H.map.Group();
//           route.sections.forEach((section: any) => {
//             let linestring = H.geo.LineString.fromFlexiblePolyline(
//               section.polyline
//             );

//             let polyline = new H.map.Polyline(linestring, {
//               data: null,
//               style: {
//                 lineWidth: 4,
//                 strokeColor: "rgba(0,128,255,0.7)",
//               },
//             });

//             map.addObject(polyline);
//             map.getViewModel().setLookAtData({
//               bounds: polyline.getBoundingBox() ?? undefined,
//             });

//             // ---

//             let poly = linestring.getLatLngAltArray();
//             let actions = section.actions;
//             for (let i = 0; i < actions.length; i++) {
//               let action = actions[i];
//               var svgMarkup =
//                 '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#1b468d" stroke="white" stroke-width="1" /><text text-anchor="middle" x="50%" y="50%" font-size="16px" fill="white" dy=".3em" >' +
//                 i +
//                 "</text></svg>";
//               var dotIcon = new H.map.Icon(svgMarkup, {
//                 anchor: { x: 8, y: 8 },
//               });
//               var marker = new H.map.Marker(
//                 {
//                   lat: poly[action.offset * 3],
//                   lng: poly[action.offset * 3 + 1],
//                 },
//                 { data: null, icon: dotIcon }
//               );
//               // = action.instruction;
//               group.addObject(marker);
//             }

//             group.addEventListener("tap", (evt: any) => {
//               map.setCenter(evt.target.getGeometry());
//             });

//             map.addObject(group);
//           });
//         },
//         onError = function (error: any) {
//           console.log(error);
//         };

//       service?.calculateRoute(routeParams, onResult, onError);
//     }
//   }, [data, platform]);

//   return <></>;
// }
