import H from "@here/maps-api-for-javascript";

export default function initMapObjectEvents(
  mapObject: H.map.Object,
  objectEvents: any,
  platformOptions: any
) {
  const { useEvents, interactive, mapEvents } = platformOptions;
  if (useEvents && interactive && objectEvents) {
    for (const type in mapEvents) {
      if (mapEvents.hasOwnProperty(type)) {
        const objectEventCallback = objectEvents[type];
        if (objectEventCallback && typeof objectEventCallback === "function") {
          mapObject.addEventListener(type, function (evt: any) {
            objectEventCallback.apply(null, arguments);
          });
        }
      }
    }
  }
}
