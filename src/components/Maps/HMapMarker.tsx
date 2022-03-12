export {};
// import H from "@here/maps-api-for-javascript";
// import { useEffect, useState } from "react";

// export interface HMapMarkerProps {
//   //position: H.geo.IPoint | H.geo.MultiPoint;
//   data: H.geo.IPoint | string;
//   map?: H.Map;
//   platform?: H.service.Platform;
//   options?: H.map.Marker.Options;
// }

// export default function HMapMarker(props: HMapMarkerProps) {
//   const { map, platform, data, options } = props;
//   const [position, setPosition] = useState<H.geo.IPoint>();

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
//       var geocoder = platform?.getGeocodingService();
//       var geocodingParams = {
//           searchText: data,
//         },
//         onResult = function (result: any) {
//           let p = result.Response.View[0].Result[0].Location.DisplayPosition;
//           setPosition({ lat: p.Latitude, lng: p.Longitude });
//         },
//         onError = function (error: any) {
//           console.log(error);
//         };

//       geocoder?.geocode(geocodingParams, onResult, onError);
//     }
//   }, [data, platform]);

//   useEffect(() => {
//     if (position) {
//       const _marker = new H.map.Marker(position, options);

//       map.addObject(_marker);
//     }
//   }, [map, options, position]);

//   return <></>;
// }
