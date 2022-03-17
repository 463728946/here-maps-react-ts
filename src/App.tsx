import {
  Autocomplete,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  AppBar,
  Toolbar,
  Drawer,
  Stack,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import CSVReader from "react-csv-reader";
import { useRef, useState } from "react";
import TMap, { IData, IRUN } from "./TMap";
import React from "react";

export interface IRequest {
  func: "route" | "find";
  mode: {
    routingMode: "fast" | "short" | "fastest" | "shortest" | "balanced";
    transportMode: "car" | "truck";
    traffic: "disabled" | "enabled";
  };
  departure: Date;
  improveFor: "distance" | "time" | null;
  start: IData | null;
  end: IData | null;
}

function App() {
  const [open, setOpen] = React.useState(false);
  const [table, setTable] = React.useState<IData[]>();
  const mapRef = useRef<IRUN>();
  const [request, setRequest] = useState<IRequest>({
    func: "find",
    mode: {
      routingMode: "fastest",
      transportMode: "truck",
      traffic: "disabled",
    },
    departure: new Date(),
    improveFor: null,
    start: null,
    end: null,
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

  const handleonFileLoaded = (data: Array<Array<string>>) => {
    let temp: IData[] = [];
    for (let index = 1; index < data.length; index++) {
      const row = data[index];
      if (row.length === 7) {
        temp.push({
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
        });
      }
    }
    setTable(temp);
  };

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      setOpen(open);
    };

  const stack = (
    <Stack direction="row" spacing={2}>
      <Select
        value={request.func}
        variant="outlined"
        onChange={(e) => {
          var value = e.target.value;
          if (value === "route" || value === "find") {
            if (value === "route") {
              setRequest({
                ...request,
                func: value,
                mode: { ...request.mode, routingMode: "fast" },
              });
            } else if (value === "find") {
              setRequest({
                ...request,
                func: value,
                mode: { ...request.mode, routingMode: "fastest" },
              });
            }
          }
        }}
      >
        <MenuItem value={"find"}>find</MenuItem>
        <MenuItem value={"route"}>route</MenuItem>
      </Select>
      <Select
        label="mode"
        value={request.mode.routingMode}
        onChange={(e) => {
          var v = e.target.value;
          if (
            v === "fast" ||
            v === "short" ||
            v === "fastest" ||
            v === "shortest" ||
            v === "balanced"
          ) {
            let temp = { ...request };
            temp.mode.routingMode = v;
            setRequest(temp);
          }
        }}
      >
        {request.func === "route"
          ? ["fast", "short"].map((v, i) => (
              <MenuItem key={i} value={v}>
                {v}
              </MenuItem>
            ))
          : ["fastest", "shortest", "balanced"].map((v, i) => (
              <MenuItem key={i} value={v}>
                {v}
              </MenuItem>
            ))}
      </Select>
      <Select
        label="transport"
        value={request.mode.transportMode}
        onChange={(e) => {
          var v = e.target.value;
          if (v === "car" || v === "truck") {
            let temp = { ...request };
            temp.mode.transportMode = v;
            setRequest(temp);
          }
        }}
      >
        <MenuItem value={"car"}>car</MenuItem>
        <MenuItem value={"truck"}>truck</MenuItem>
      </Select>
      <Select
        label="traffic"
        disabled={request.func === "route"}
        value={request.mode.traffic}
        onChange={(e) => {
          var v = e.target.value;
          if (v === "enabled" || v === "disabled") {
            let temp = { ...request };
            temp.mode.traffic = v;
            setRequest(temp);
          }
        }}
      >
        <MenuItem value={"enabled"}>enabled</MenuItem>
        <MenuItem value={"disabled"}>disabled</MenuItem>
      </Select>
      <Autocomplete
        value={request.start}
        options={table ?? []}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => <TextField {...params} label="Start" />}
        onChange={(e, value) => {
          setRequest({
            ...request,
            start: value,
          });
        }}
      />
      <Autocomplete
        value={request.end}
        options={table ?? []}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => <TextField {...params} label="End" />}
        onChange={(e, value) =>
          setRequest({
            ...request,
            end: value,
          })
        }
      />
      <Button color="inherit" onClick={() => mapRef.current?.run()}>
        run
      </Button>
      <Button color="inherit" onClick={toggleDrawer(true)}>
        show table
      </Button>
    </Stack>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {table === undefined ? (
            <CSVReader
              disabled={table !== undefined}
              onFileLoaded={handleonFileLoaded}
            />
          ) : (
            stack
          )}
        </Toolbar>
      </AppBar>
      <Drawer anchor={"top"} open={open} onClose={toggleDrawer(false)}>
        <Box sx={{ width: "auto", height: 900 }}>
          <DataGrid rows={table ?? []} columns={columns} />
        </Box>
      </Drawer>
      <TMap config={request} table={table ?? []} ref={mapRef} />
      {/* <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={runing}
      >
        <CircularProgress color="inherit" />
      </Backdrop> */}
    </Box>
  );
}
export default App;
