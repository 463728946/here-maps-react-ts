import React, { useEffect } from "react";
import { useState } from "react";
import H from "@here/maps-api-for-javascript";
import moment from "moment";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import CSVReader from "react-csv-reader";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import ITourPlanningRequest, {
  IFleet,
  IJob,
  IJobTask,
  IVehicleType,
  ProfileType,
} from "./ITourPlanningRequest";

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
  point?: {
    lat: number;
    lng: number;
  };
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
  const colorList: string[] = [];
  const [background, setBackground] = React.useState<boolean>(false);
  const [geocoder, setGeocoder] = useState<H.service.GeocodingService>();
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
  const [tourConfig, setTourConfig] = useState<{
    drivernum: number;
    maxdistance: number;
    shiftTime: number;
    profile: ProfileType;
  }>({
    drivernum: 1,
    maxdistance: 3000,
    shiftTime: 86400,
    profile: "truck",
  });

  const [distance, setDistance] = useState({
    distance: 0,
    time: 0,
  });
  const [duration, setDuration] = useState({
    duration: 0,
    lenght: 0,
  });
  const [tourStatistic, setTourStatistic] = useState({
    cost: 0,
    distance: 0,
    duration: 0,
    times: {
      driving: 0,
      serving: 0,
      waiting: 0,
      break: 0,
    },
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
      setUI(ui);
    }
  }, []);

  function geocode(item: IData) {
    geocoder?.geocode(
      { searchText: item.address },
      (result: any) => {
        let position =
          result.Response.View[0].Result[0].Location.DisplayPosition;
        item.point = {
          lat: position.Latitude,
          lng: position.Longitude,
        };
        var marker = new H.map.Marker(item.point, {
          data: item.id,
          icon: markerIcon("", "#9e9e9e", "circle"),
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

  function clear(tourplanning: boolean) {
    var objs = map?.getObjects();
    objs?.forEach((x) => {
      if (x?.getData() === "group") {
        (x as H.map.Group).removeAll();
        map?.removeObject(x);
      } else if (x && tourplanning) {
        map?.removeObject(x);
      }
    });
  }

  function getFleet(item?: { lat: number; lng: number }): IFleet {
    if (item === undefined) {
      throw new Error("error id");
    }

    var vehicles: IVehicleType[] = [];
    for (let index = 1; index <= tourConfig.drivernum; index++) {
      const driver = `driver${index}`;
      vehicles.push({
        id: driver,
        profile: "default",
        costs: {
          fixed: 0,
          distance: 0,
          time: 0.00000000001,
        },
        shifts: [
          {
            start: {
              time: moment().format(),
              location: {
                lat: item.lat,
                lng: item.lng,
              },
            },
          },
        ],
        limits: {
          maxDistance: tourConfig.maxdistance,
          shiftTime: tourConfig.shiftTime,
        },
        capacity: [1],
        amount: 1,
      });
    }

    return {
      types: vehicles,
      profiles: [
        {
          name: "default",
          type: tourConfig.profile,
        },
      ],
    };
  }

  function data2Task(item?: IData): IJobTask {
    if (item === undefined) {
      throw new Error("error id");
    }
    return {
      places: [
        {
          location: item.point!,
          duration: 0,
        },
      ],
      demand: [0],
    };
  }

  function getJobs(items: IData[]): IJob[] {
    var result: IJob[] = [];
    var exclude: string[] = [];
    items
      .filter((f) => f.beforeId !== "")
      .forEach((m) => {
        exclude.push(m.id);
        var ids = m.beforeId.split(",");
        var job = {
          id: m.id,
          tasks: {
            pickups: [data2Task(m)],
            deliveries: ids.map((fid) => {
              exclude.push(fid);
              return data2Task(items.find((x) => x.id === fid));
            }),
          },
        };
        result.push(job);
      });

    items
      .filter((f) => exclude.findIndex((s) => s === f.id) === -1)
      .forEach((m) => {
        result.push({
          id: m.id,
          tasks: {
            deliveries: [data2Task(m)],
          },
        });
      });

    return result;
  }

  function tourplanning() {
    setBackground(true);
    clear(true);
    const start = data.start!;
    const end = data.end!;
    // start.marker?.setIcon(dotIcon("S"));
    // end.marker?.setIcon(dotIcon("E"));

    var jobitems = table.filter((f) => f.id !== start.id && f.id !== end.id);

    var url =
      "https://tourplanning.hereapi.com/v3/problems?apiKey=WuSNnukdxFbTveIKlx_HYgkZGbSkFxaS29ivn2edc3U";
    var request: ITourPlanningRequest = {
      fleet: getFleet(start.point),
      plan: {
        jobs: getJobs(jobitems),
      },
    };

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", () => {
      const response = JSON.parse(xhr.responseText);
      setTourStatistic(response.statistic);
      response.tours.forEach((tour: any) => {
        var mainColor = getRandomColor();

        var url = buildStops(tour.stops, end, mainColor);
        routev8(url, mainColor);
      });
      setBackground(false);
    });

    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(request));
  }

  function buildStops(stops: any[], end: IData, color: string) {
    var seq = 0;
    var waypoints = stops.map((s: any) => {
      var id = s.activities[0].jobId;
      var type = s.activities[0].type as string;
      var location = s.location;
      var param = "";
      if (type === "departure") {
        map?.addObject(
          new H.map.Marker(location, {
            data: "start",
            icon: markerIcon("S", color),
          })
        );
        param = "origin";
      } else {
        map?.addObject(
          new H.map.Marker(location, {
            data: id,
            icon: markerIcon(
              seq,
              color,
              type === "delivery" ? "circle" : "rect"
            ),
          })
        );
        param = "via";
      }
      seq++;
      return `${param}=${location.lat},${location.lng}`;
    });
    map?.addObject(
      new H.map.Marker(end.point!, {
        data: "end",
        icon: markerIcon("end", color),
      })
    );
    waypoints.push(`destination=${end.point?.lat},${end.point?.lng}`);

    return (
      `https://router.hereapi.com/v8/routes?apiKey=BXkE_sgUvewFFWfZOu1jewbPIibBLsH4XrQgGfv0Zho` +
      `&return=polyline,summary` +
      `&routingMode=fast` +
      `&transportMode=${data.mode.transportMode}&${waypoints.join("&")}`
    );
  }

  function findsequence2() {
    setBackground(true);
    clear(false);
    const mainColor = getRandomColor();
    const start = data.start!;
    const end = data.end!;
    start.marker?.setIcon(markerIcon("S", mainColor));
    end.marker?.setIcon(markerIcon("E", mainColor));
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
            mk.marker?.setIcon(markerIcon(wp.sequence, mainColor, "circle"));
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

      routev8(buildVia(waypoints), mainColor);
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
        if (m.acc)
          m.constraints += `acc:${m.acc
            .replace(/\+/g, "%2B")
            .replace(/\|/g, "%7C")};`;
        if (m.at)
          m.constraints += `at:${m.at
            .replace(/\+/g, "%2B")
            .replace(/\|/g, "%7C")};`;
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
        fulfilledConstraints?: [];
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

  function routev8(via: string, color: string) {
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
          group.addObjects([
            getOutline(linestring, color),
            getArrows(linestring),
          ]);
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

  function getRandomColor() {
    let r = Math.floor(Math.random() * 192);
    let g = Math.floor(Math.random() * 192);
    let b = Math.floor(Math.random() * 192);
    let r16 =
      r.toString(16).length === 1 && r.toString(16) <= "f"
        ? 0 + r.toString(16)
        : r.toString(16);
    let g16 =
      g.toString(16).length === 1 && g.toString(16) <= "f"
        ? 0 + g.toString(16)
        : g.toString(16);
    let b16 =
      b.toString(16).length === 1 && b.toString(16) <= "f"
        ? 0 + b.toString(16)
        : b.toString(16);
    let color = "#" + r16 + g16 + b16;
    if (colorList.indexOf(color) === -1) {
      colorList.push(color);
    } else {
      color = getRandomColor();
    }
    return color;
  }

  const markerIcon = (
    index: number | string,
    fill: string,
    shape?: "circle" | "rect"
  ) => {
    const text =
      index === undefined
        ? null
        : '<text text-anchor="middle" x="50%" y="50%" font-size="8px" fill="white" dy=".3em" >' +
          index +
          "</text>";

    var _shape =
      shape === "circle"
        ? `<circle cx="9" cy="9" r="9" fill="${fill}" stroke="white" stroke-width="1" />`
        : shape === "rect"
        ? `<rect width="18" height="18" fill="${fill}" stroke="white" stroke-width="1"  />`
        : `<path stroke="white" d="m0,6.822l6.85251,0l2.11748,-6.822l2.11748,6.822l6.85251,0l-5.54379,4.21618l2.11759,6.822l-5.54379,-4.21629l-5.54379,4.21629l2.11759,-6.822l-5.54379,-4.21618z" fill="red"/>`;

    var svg =
      `<svg width="18" height="18" xmlns="http://www.w3.org/2000/svg">` +
      _shape +
      text +
      "</svg>";
    return new H.map.Icon(svg, {
      anchor: { x: 8, y: 8 },
    });
  };

  const getOutline = (linestring: H.geo.LineString, color: string) =>
    new H.map.Polyline(linestring, {
      data: null,
      arrows: {},
      style: {
        lineWidth: 8,
        strokeColor: color,
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

  const commomContainer = (
    <Grid container spacing={2} p={2}>
      <Grid item xs={6}>
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
      <Grid item xs={6}>
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
      <Grid item xs={6}>
        {XTextField("lenght", duration.lenght / 1000, "km")}
      </Grid>
      <Grid item xs={6}>
        {XTextField("duration", duration.duration / 60, "min")}
      </Grid>
    </Grid>
  );

  const findAccordion = (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>FindSequence</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={1}>
          <Grid item xs={3}>
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
          <Grid item xs={3}>
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
          <Grid item xs={3}>
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
          <Grid item xs={3}>
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
              Route
            </Button>
          </Grid>
        </Grid>
        <Divider>result</Divider>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            {XTextField("distance", distance.distance / 1000, "km")}
          </Grid>
          <Grid item xs={6}>
            {XTextField("time", distance.time / 60, "min")}
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  const tourAccordion = (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>TourPlanning</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={1}>
          <Grid item xs={3}>
            <TextField
              size="small"
              type="number"
              label="Driver(s)"
              fullWidth
              value={tourConfig.drivernum}
              onChange={(event) => {
                var num = parseInt(event.target.value);
                setTourConfig({
                  ...tourConfig,
                  drivernum: num,
                });
              }}
            />{" "}
          </Grid>
          <Grid item xs={3}>
            <TextField
              size="small"
              type="number"
              label="Max Distance"
              fullWidth
              value={tourConfig.maxdistance}
              onChange={(event) => {
                var num = parseInt(event.target.value);
                setTourConfig({
                  ...tourConfig,
                  maxdistance: num,
                });
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              size="small"
              type="number"
              label="shiftTime"
              fullWidth
              value={tourConfig.shiftTime}
              onChange={(event) => {
                var num = parseInt(event.target.value);
                setTourConfig({
                  ...tourConfig,
                  shiftTime: num,
                });
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <Select
              size="small"
              label="mode"
              fullWidth
              value={tourConfig.profile}
              onChange={(e) => {
                var v = e.target.value;
                if (
                  v === "scooter" ||
                  v === "bicycle" ||
                  v === "pedestrian" ||
                  v === "car" ||
                  v === "truck"
                ) {
                  setTourConfig({
                    ...tourConfig,
                    profile: v,
                  });
                }
              }}
            >
              <MenuItem value={"scooter"}>scooter</MenuItem>
              <MenuItem value={"bicycle"}>bicycle</MenuItem>
              <MenuItem value={"pedestrian"}>pedestrian</MenuItem>
              <MenuItem value={"car"}>car</MenuItem>
              <MenuItem value={"truck"}>truck</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              onClick={tourplanning}
              disabled={data.start === null || data.end === null}
            >
              Route
            </Button>
          </Grid>
          <Divider>statistic</Divider>
          <Grid container spacing={1}>
            <Grid item xs={4}>
              {XTextField("cost", tourStatistic.cost, "$")}
            </Grid>
            <Grid item xs={4}>
              {XTextField("distance", tourStatistic.distance / 1000, "km")}
            </Grid>
            <Grid item xs={4}>
              {XTextField("duration", tourStatistic.duration / 1000, "km")}
            </Grid>
            <Grid item xs={3}>
              {XTextField("driving times", tourStatistic.times.driving, "sec")}
            </Grid>
            <Grid item xs={3}>
              {XTextField("serving times", tourStatistic.times.serving, "sec")}
            </Grid>
            <Grid item xs={3}>
              {XTextField("waiting times", tourStatistic.times.waiting, "sec")}
            </Grid>
            <Grid item xs={3}>
              {XTextField("break times", tourStatistic.times.break, "sec")}
            </Grid>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  const tabletAccordion = (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Table</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <DataGrid sx={{ height: 300 }} rows={table ?? []} columns={columns} />
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Box>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={background}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid container>
        <Grid item xs={5}>
          <List>
            {table.length !== 0 ? null : (
              <ListItem>
                <CSVReader onFileLoaded={handleonFileLoaded} />
                <ListItemText>ver0.7.0</ListItemText>
              </ListItem>
            )}
            <ListItem>{commomContainer}</ListItem>
            {findAccordion}
            {tourAccordion}
            {tabletAccordion}
          </List>
        </Grid>
        <Grid item xs={7}>
          <div id="mapContainer" ref={mapRef} style={{ height: 800 }} />
        </Grid>
      </Grid>
    </Box>
  );
});

export default TMap;
