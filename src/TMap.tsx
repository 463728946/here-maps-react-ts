import React, { useEffect } from "react";
import { useState } from "react";
import H from "@here/maps-api-for-javascript";
import moment from "moment";
import {
  Autocomplete,
  Backdrop,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Slider,
  TextField,
} from "@mui/material";
import CSVReader from "react-csv-reader";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { HexColorPicker } from "react-colorful";

export interface IRequest {
  mode: {
    routingMode: "fastest" | "shortest" | "balanced";
    transportMode: "car" | "truck";
    traffic: "disabled" | "enabled";
  };
  departure: Date;
  improve: "distance" | "time" | "";
  start: IData | null;
  end: IData | null;
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
  route(): void;
}

const TMap = React.forwardRef(() => {
  const mapRef = React.createRef<HTMLDivElement>();

  const platform = new H.service.Platform({
    apikey: "BXkE_sgUvewFFWfZOu1jewbPIibBLsH4XrQgGfv0Zho",
  });

  const [background, setBackground] = React.useState<boolean>(false);
  const [colorCircle, setColorCircle] = useState<string>("#f44336");
  const [sizeCircle, setSizeCircle] = useState<number>(8);

  const [colorLine, setColorLine] = useState<string>("#304ffe");
  const [sizeLine, setSizeLine] = useState<number>(10);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [geocoder, setGeocoder] = useState<H.service.GeocodingService>();
  const [routeService, setRtoueService] = useState<H.service.RoutingService8>();
  const [layers, setLayers] = useState<H.service.DefaultLayers>();
  const [map, setMap] = useState<H.Map>();
  const [ui, setUI] = useState<H.ui.UI>();
  const [table, setTable] = React.useState<IData[]>([]);
  const [data, setData] = useState<IRequest>({
    mode: {
      routingMode: "fastest",
      transportMode: "truck",
      traffic: "disabled",
    },
    departure: new Date(),
    improve: "",
    start: null,
    end: null,
  });
  const [distance, setDistance] = useState({
    distance: 0,
    time: 0,
  });
  const [duration, setDuration] = useState({
    duration: 0,
    lenght: 0,
  });

  const columns: GridColDef[] = [
    { field: "id", headerName: "Id", width: 50 },
    { field: "name", headerName: "Name", width: 100 },
    { field: "address", headerName: "address", width: 100 },
    { field: "location", headerName: "location", width: 100 },
    { field: "st", headerName: "st", width: 150 },
    { field: "at", headerName: "at", width: 150 },
    { field: "acc", headerName: "acc", width: 150 },
    { field: "beforeId", headerName: "beforeId", width: 150 },
    { field: "destination", headerName: "destination", width: 100 },
    { field: "constraints", headerName: "constraints", width: 200 },
    { field: "sequence", headerName: "sequence", width: 100 },
    { field: "departure", headerName: "预计出发", width: 200 },
    { field: "arrival", headerName: "预计到达", width: 200 },
  ];

  useEffect(() => {
    if (platform && mapRef.current) {
      let _leyers = platform.createDefaultLayers();
      setLayers(_leyers);
      let _map = new H.Map(mapRef.current, _leyers.vector.normal.map, {
        zoom: 10,
        center: {
          lat: 37.42487,
          lng: -121.88927,
        },
      });
      window.addEventListener("resize", () => _map.getViewPort().resize());
      setMap(_map);
      let ui = H.ui.UI.createDefault(_map, _leyers);
      let events = new H.mapevents.MapEvents(_map);
      new H.mapevents.Behavior(events);
      setGeocoder(platform.getGeocodingService());
      setRtoueService(platform.getRoutingService(undefined, 8));
      setUI(ui);
    }
  }, []);

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
          data: item.id,
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

  function clear() {
    var objs = map?.getObjects();
    objs?.forEach((x) => {
      if (x?.getData() === "group") {
        (x as H.map.Group).removeAll();
        map?.removeObject(x);
      }
    });
  }

  function findsequence2() {
    setBackground(true);
    clear();
    const start = data.start!;
    const end = data.end!;
    start.marker?.setIcon(dotIcon("S"));
    end.marker?.setIcon(dotIcon("E"));
    const improve =
      data.improve === "distance"
        ? `&improveFor=distance`
        : data.improve === "time"
        ? `&improveFor=time`
        : "";
    var baseurl =
      "https://wps.hereapi.com/v8/findsequence2?apiKey=BXkE_sgUvewFFWfZOu1jewbPIibBLsH4XrQgGfv0Zho" +
      `&mode=${data.mode.routingMode};${data.mode.transportMode};traffic:${data.mode.traffic};` +
      `&departure=${moment().format("YYYY-MM-DDTHH:mm:ssZ")}` +
      improve +
      `&start=${start.location}&end=${end.location}` +
      getDestinations(start, end);

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", () => {
      const response = JSON.parse(xhr.responseText);
      const waypoints = response.results[0].waypoints;

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
            mk.marker?.setIcon(dotIcon(wp.sequence, colorCircle));
            mk.arrival = moment(wp.estimatedArrival).toNow();
            mk.departure = moment(wp.estimatedDeparture).toNow();
          } else {
            throw new Error("miss some marker");
          }
        }
      });

      setDistance({
        distance: response.results[0].distance,
        time: response.results[0].time,
      });

      routev8(buildVia(waypoints));
      setBackground(false);
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

  function buildVia(
    waypoints: [
      {
        id: string;
        lat: number;
        lng: number;
        sequence: number;
        estimatedArrival?: Date;
        estimatedDeparture?: Date;
        fulfilledConstraints: [];
      }
    ]
  ) {
    const origin = waypoints.find((x) => x.id === "start");
    const destination = waypoints.find((x) => x.id === "end");

    var baseUrl =
      `https://router.hereapi.com/v8/routes?apiKey=BXkE_sgUvewFFWfZOu1jewbPIibBLsH4XrQgGfv0Zho` +
      `&return=polyline,summary` +
      `&routingMode=fast` +
      `&transportMode=${data.mode.transportMode}` +
      `&origin=${origin!.lat},${origin!.lng}&destination=${destination!.lat},${
        destination!.lng
      }` +
      `${waypoints
        .filter((x) => x.id !== "start" && x.id !== "end")
        .map((w) => `&via=${w.lat},${w.lng}`)
        .join("")}`;

    return baseUrl;
  }

  function routev8(via: string) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", () => {
      const response = JSON.parse(xhr.responseText);
      var route = response.routes[0];
      var d = 0,
        l = 0;
      route.sections.forEach((section: any) => {
        d += section.summary.duration;
        l += section.summary.length;
        let linestring = H.geo.LineString.fromFlexiblePolyline(
          section.polyline
        );
        if (linestring) {
          var group = new H.map.Group({
            data: "group",
          });
          group.addObjects([getOutline(linestring), getArrows(linestring)]);
          map?.addObject(group);
        }
      });

      setDuration({
        duration: d,
        lenght: l,
      });
    });
    xhr.open("GET", via);
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
        lineWidth: sizeLine,
        strokeColor: colorLine, //`rgba(102, 51, 255, 0.8)`,
        lineTailCap: "arrow-tail",
        lineHeadCap: "arrow-head",
      },
    });

  const getArrows = (linestring: H.geo.LineString) =>
    new H.map.Polyline(linestring, {
      data: null,
      style: {
        lineWidth: 6,
        fillColor: "white",
        strokeColor: "white",
        lineDash: [0, 5],
        lineTailCap: "arrow-tail",
        lineHeadCap: "arrow-head",
      },
    });

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

  const handleonFileLoaded = (data: Array<Array<string>>) => {
    let temp: IData[] = [];
    for (let index = 1; index < data.length; index++) {
      const row = data[index];
      if (row.length === 7) {
        var item: IData = {
          id: row[0],
          name: row[1],
          address: row[2],
          st: row[3],
          at: row[4],
          acc: row[5],
          beforeId: row[6],

          location: "",
          destination: "",
          constraints: "",
          sequence: -1,
          arrival: "",
          departure: "",
        };
        geocode(item);
        temp.push(item);
      }
    }
    setTable(temp);
  };

  const configContainer = (
    <Grid container spacing={2} p={2}>
      <Menu
        open={anchorEl !== null}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <Card>
          <CardContent>
            <HexColorPicker
              color={anchorEl?.title === "circle" ? colorCircle : colorLine}
              onChange={(v) => {
                if (anchorEl?.title === "circle") {
                  setColorCircle(v);
                } else {
                  setColorLine(v);
                }
              }}
            />
          </CardContent>
        </Card>
      </Menu>
      <Grid item xs={4}>
        <Autocomplete
          fullWidth
          value={data.start}
          options={table ?? []}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => <TextField {...params} label="Start" />}
          onChange={(e, value) => {
            setData({
              ...data,
              start: value,
            });
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <Autocomplete
          value={data.end}
          fullWidth
          options={table ?? []}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => <TextField {...params} label="End" />}
          onChange={(e, value) =>
            setData({
              ...data,
              end: value,
            })
          }
        />
      </Grid>
      <Grid item xs={4}>
        <Select
          label="mode"
          fullWidth
          value={data.mode.routingMode}
          onChange={(e) => {
            var v = e.target.value;
            if (v === "fastest" || v === "shortest" || v === "balanced") {
              let temp = { ...data };
              temp.mode.routingMode = v;
              setData(temp);
            }
          }}
        >
          <MenuItem value={"fastest"}>fastest</MenuItem>
          <MenuItem value={"shortest"}>shortest</MenuItem>
          <MenuItem value={"balanced"}>balanced</MenuItem>
        </Select>
      </Grid>
      <Grid item xs={4}>
        <Select
          label="transport"
          fullWidth
          value={data.mode.transportMode}
          onChange={(e) => {
            var v = e.target.value;
            if (v === "car" || v === "truck") {
              let temp = { ...data };
              temp.mode.transportMode = v;
              setData(temp);
            }
          }}
        >
          <MenuItem value={"car"}>car</MenuItem>
          <MenuItem value={"truck"}>truck</MenuItem>
        </Select>
      </Grid>
      <Grid item xs={4}>
        <Select
          label="traffic"
          fullWidth
          value={data.mode.traffic}
          onChange={(e) => {
            var v = e.target.value;
            if (v === "enabled" || v === "disabled") {
              let temp = { ...data };
              temp.mode.traffic = v;
              setData(temp);
            }
          }}
        >
          <MenuItem value={"enabled"}>enabled</MenuItem>
          <MenuItem value={"disabled"}>disabled</MenuItem>
        </Select>
      </Grid>
      <Grid item xs={4}>
        <Select
          fullWidth
          label="improve"
          value={data.improve}
          onChange={(e) => {
            var v = e.target.value;
            if (v === "distance" || v === "time" || v === "") {
              let temp = { ...data };
              temp.improve = v;
              setData(temp);
            }
          }}
        >
          <MenuItem value={""}></MenuItem>
          <MenuItem value={"distance"}>distance</MenuItem>
          <MenuItem value={"time"}>time</MenuItem>
        </Select>
      </Grid>

      <Grid item xs={12}>
        <Button
          fullWidth
          variant="contained"
          onClick={findsequence2}
          disabled={data.start === null || data.end === null}
        >
          route
        </Button>
      </Grid>
    </Grid>
  );

  const resultContainer = (
    <Grid container spacing={1} p={2}>
      <Grid item xs={6}>
        {XTextField("distance", distance.distance / 1000, "km")}
      </Grid>
      <Grid item xs={6}>
        {XTextField("time", distance.time / 60, "min")}
      </Grid>

      <Grid item xs={6}>
        {XTextField("lenght", duration.lenght / 1000, "km")}
      </Grid>
      <Grid item xs={6}>
        {XTextField("duration", duration.duration / 60, "min")}
      </Grid>
    </Grid>
  );

  const tabletContainer = (
    <Grid container spacing={1} p={2}>
      <DataGrid sx={{ height: 300 }} rows={table ?? []} columns={columns} />
    </Grid>
  );

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
              <ListItemText>ver0.5.0</ListItemText>
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

export default TMap;
