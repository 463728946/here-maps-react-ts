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

function App() {
  const [open, setOpen] = React.useState(false);
  const [table, setTable] = React.useState<IData[]>();
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

  // const stack = (
  //   <Stack direction="row" spacing={2}>
  //     <Select
  //       label="mode"
  //       fullWidth
  //       value={request.mode.routingMode}
  //       onChange={(e) => {
  //         var v = e.target.value;
  //         if (v === "fastest" || v === "shortest" || v === "balanced") {
  //           let temp = { ...request };
  //           temp.mode.routingMode = v;
  //           setRequest(temp);
  //         }
  //       }}
  //     >
  //       <MenuItem value={"fastest"}>fastest</MenuItem>
  //       <MenuItem value={"shortest"}>shortest</MenuItem>
  //       <MenuItem value={"balanced"}>balanced</MenuItem>
  //     </Select>
  //     <Select
  //       label="transport"
  //       fullWidth
  //       value={request.mode.transportMode}
  //       onChange={(e) => {
  //         var v = e.target.value;
  //         if (v === "car" || v === "truck") {
  //           let temp = { ...request };
  //           temp.mode.transportMode = v;
  //           setRequest(temp);
  //         }
  //       }}
  //     >
  //       <MenuItem value={"car"}>car</MenuItem>
  //       <MenuItem value={"truck"}>truck</MenuItem>
  //     </Select>
  //     <Select
  //       label="traffic"
  //       fullWidth
  //       value={request.mode.traffic}
  //       onChange={(e) => {
  //         var v = e.target.value;
  //         if (v === "enabled" || v === "disabled") {
  //           let temp = { ...request };
  //           temp.mode.traffic = v;
  //           setRequest(temp);
  //         }
  //       }}
  //     >
  //       <MenuItem value={"enabled"}>enabled</MenuItem>
  //       <MenuItem value={"disabled"}>disabled</MenuItem>
  //     </Select>
  //     <Select
  //       fullWidth
  //       label="improve"
  //       value={request.improve}
  //       onChange={(e) => {
  //         var v = e.target.value;
  //         if (v === "distance" || v === "time" || v === "") {
  //           let temp = { ...request };
  //           temp.improve = v;
  //           setRequest(temp);
  //         }
  //       }}
  //     >
  //       <MenuItem value={""}></MenuItem>
  //       <MenuItem value={"distance"}>distance</MenuItem>
  //       <MenuItem value={"time"}>time</MenuItem>
  //     </Select>
  //     <Autocomplete
  //       fullWidth
  //       value={request.start}
  //       options={table ?? []}
  //       getOptionLabel={(option) => option.name}
  //       renderInput={(params) => <TextField {...params} label="Start" />}
  //       onChange={(e, value) => {
  //         setRequest({
  //           ...request,
  //           start: value,
  //         });
  //       }}
  //     />
  //     <Autocomplete
  //       value={request.end}
  //       fullWidth
  //       options={table ?? []}
  //       getOptionLabel={(option) => option.name}
  //       renderInput={(params) => <TextField {...params} label="End" />}
  //       onChange={(e, value) =>
  //         setRequest({
  //           ...request,
  //           end: value,
  //         })
  //       }
  //     />
  //     <Button color="inherit" onClick={() => mapRef.current?.route()}>
  //       route
  //     </Button>
  //     <Button color="inherit" onClick={toggleDrawer(true)}>
  //       show table
  //     </Button>
  //   </Stack>
  // );

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* <AppBar position="static">
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
      </AppBar> */}
      <Drawer anchor={"top"} open={open} onClose={toggleDrawer(false)}></Drawer>
      <TMap />
    </Box>
  );
}
export default App;
