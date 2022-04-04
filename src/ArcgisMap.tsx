import React, { useEffect, useState } from "react";
import {
  Backdrop,
  Button,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material";
import CSVReader from "react-csv-reader";
import esriConfig from "@arcgis/core/config";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Symbol from "@arcgis/core/symbols/Symbol";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import CIMSymbol from "@arcgis/core/symbols/CIMSymbol";

import FeatureSet from "@arcgis/core/rest/support/FeatureSet";
import RouteParameters from "@arcgis/core/rest/support/RouteParameters";
import Stop from "@arcgis/core/rest/support/Stop";
import * as locator from "@arcgis/core/rest/locator";
import * as route from "@arcgis/core/rest/route";
import routeTask from "@arcgis/core/tasks/RouteTask";
import Point from "@arcgis/core/geometry/Point";
import { ViewAgenda } from "@mui/icons-material";

const routeUrl =
  "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";

const locatorUrl =
  "http://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";

export interface IData extends Itemplate {}
export interface Itemplate {
  id: string;
  name: string;
  address: string;
  st: string;
  at: string;
  acc: string;
  beforeId: string;
}

export interface IRUN {
  route(): void;
}

const ArcgisMap = React.forwardRef(() => {
  const mapRef = React.createRef<HTMLDivElement>();
  const [table, setTable] = React.useState<IData[]>([]);
  const [background, setBackground] = React.useState<boolean>(false);
  const [mapView, setMapView] = useState<MapView>();
  const [graphicsLayer, setGraphicsLayer] = React.useState<GraphicsLayer>();
  const [directions, setDirections] = useState({
    totalDriveTime: 0,
    totalLength: 0,
    totalTime: 0,
  });

  useEffect(() => {
    if (mapRef.current !== null) {
      esriConfig.apiKey =
        "AAPKfa3bc71ca837494788d6a77b67fb4b234WHPftX24EN1BC5nneLkDet70JMZ617ugI9eUnNI0bAGVJnpg6XIMZ8651TEfgIs";

      const map = new Map({
        basemap: "arcgis-navigation", // Basemap layer
      });

      const view = new MapView({
        map: map,
        center: [-121.88927, 37.42487],
        zoom: 10,
        container: mapRef.current,
        constraints: {
          snapToZoom: false,
        },
      });
      setMapView(view);

      var _graphicsLayer = new GraphicsLayer();
      setGraphicsLayer(_graphicsLayer);
      map.add(_graphicsLayer);
    }
  }, []);

  const handleonFileLoaded = (data: Array<Array<string>>) => {
    let temp: IData[] = [];
    for (let index = 1; index < data.length; index++) {
      const row = data[index];
      if (row.length === 7) {
        var spaddress = row[2].split(",");
        if (spaddress.length === 3) {
          var item: IData = {
            id: row[0],
            name: row[1],
            address: row[2],
            st: row[3],
            at: row[4],
            acc: row[5],
            beforeId: row[6],
          };
          geocode(item);
          temp.push(item);
        }
      }
    }
    setTable(temp);
  };

  const geocode = (item: IData) => {
    locator
      .addressToLocations(locatorUrl, {
        address: {
          SingleLine: item.address,
        },
        countryCode: "USA",
      })
      .then((result) => {
        var location = result[0].location;
        const pointGraphic = new Graphic({
          geometry: location,
          symbol: new SimpleMarkerSymbol({
            style: "circle",
            color: [226, 119, 40],
            outline: {
              color: [255, 255, 255],
              width: 1,
            },
          }),
        });
        //graphicsLayer?.add(pointGraphic);
        mapView?.graphics.add(pointGraphic);
      });
  };

  const routing = () => {
    const array = mapView?.graphics.toArray();
    console.log(array);

    const routeParameters = new RouteParameters({
      stops: new FeatureSet({
        features: array,
      }),
      preserveFirstStop: true,
      preserveLastStop: true,
      findBestSequence: true,
      returnStops: true,
      returnDirections: true,
    });

    var task = new routeTask({ url: routeUrl });
    task.solve(routeParameters).then((data) => {});

    route.solve(routeUrl, routeParameters).then((data) => {
      console.log(data);

      data.routeResults.forEach((result) => {
        result.route.symbol = new SimpleLineSymbol({
          color: [5, 150, 255],
          width: 3,
        });
        setDirections({
          totalDriveTime: result.directions.totalDriveTime,
          totalLength: result.directions.totalLength,
          totalTime: result.directions.totalTime,
        });
        mapView?.graphics.add(result.route);
      });
    });
  };

  const configContainer = (
    <Grid container spacing={2} p={2}>
      <Grid item xs={12}>
        <Button fullWidth variant="contained" onClick={routing}>
          route
        </Button>
      </Grid>
    </Grid>
  );

  const XTextField = (label: string, value: number, unit: string) => {
    return (
      <TextField
        fullWidth
        disabled
        label={label}
        value={value}
        InputProps={{
          endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
        }}
      />
    );
  };
  const resultContainer = (
    <Grid container spacing={1} p={2}>
      <Grid item xs={4}>
        {XTextField("totalDriveTime", directions.totalDriveTime, "")}
      </Grid>
      <Grid item xs={4}>
        {XTextField("totalLength", directions.totalLength, "")}
      </Grid>
      <Grid item xs={4}>
        {XTextField("totalTime", directions.totalTime, "")}
      </Grid>
    </Grid>
  );

  const tabletContainer = <Grid container spacing={1} p={2}></Grid>;

  return (
    <Grid container>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={background}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid item xs={5}>
        <List>
          {table.length !== 0 ? null : (
            <ListItem>
              <CSVReader onFileLoaded={handleonFileLoaded} />
              <ListItemText>ver0.6.0</ListItemText>
            </ListItem>
          )}
          <Divider>file</Divider>
          <ListItem>{configContainer}</ListItem>
          <Divider>config</Divider>
          <ListItem>{resultContainer}</ListItem>
          <Divider>data</Divider>
          <ListItem>{tabletContainer}</ListItem>
        </List>
      </Grid>
      <Grid item xs={7}>
        <div id="mapContainer" ref={mapRef} style={{ height: 800 }} />
      </Grid>
    </Grid>
  );
});

export default ArcgisMap;
