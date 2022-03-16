import {
  Autocomplete,
  Box,
  Grid,
  TextField,
  Button,
  CssBaseline,
  styled,
  SwipeableDrawer,
  Select,
  MenuItem,
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  Drawer,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import CSVReader from "react-csv-reader";
import { useEffect, useState } from "react";
import TMap, { IData } from "./TMap";
import { Global } from "@emotion/react";
import { grey } from "@mui/material/colors";
import React from "react";
import MenuIcon from "@mui/icons-material/Menu";

const drawerBleeding = 56;
const Root = styled("div")(({ theme }) => ({
  height: "100%",
  backgroundColor:
    theme.palette.mode === "light"
      ? grey[100]
      : theme.palette.background.default,
}));

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "light" ? "#fff" : grey[800],
}));

export interface IRequest {
  func: "route" | "find";
  mode: {
    routingMode: "fast" | "short";
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
  const [runing, setRuning] = React.useState(false);
  // -----------

  const [data, setData] = useState<IData[]>([]);
  const [request, setRequest] = useState<IRequest>({
    func: "find",
    mode: {
      routingMode: "short",
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
    var result: IData[] = [];
    console.log("read file:", data);

    for (let index = 1; index < data.length; index++) {
      const row = data[index];
      if (row.length === 7) {
        result.push({
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
    setData(result);
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

  const arg = (
    <Box sx={{ width: "auto", height: 900 }}>
      <DataGrid rows={data ?? []} columns={columns} />
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <CSVReader onFileLoaded={handleonFileLoaded} />
          <Select
            disabled
            value={request.func}
            variant="outlined"
            onChange={(e) => {
              var value = e.target.value;
              if (value === "route" || value === "find") {
                setRequest({ ...request, func: value });
              }
            }}
          >
            <MenuItem value={"find"}>find</MenuItem>
            <MenuItem value={"route"}>route</MenuItem>
          </Select>
          <Select
            disabled
            label="mode"
            value={request.mode.routingMode}
            onChange={(e) => {
              var v = e.target.value;
              if (v === "fast" || v === "short") {
                let temp = { ...request };
                temp.mode.routingMode = v;
                setRequest(temp);
              }
            }}
          >
            <MenuItem value={"fast"}>fast</MenuItem>
            <MenuItem value={"short"}>short</MenuItem>
          </Select>
          <Select
            disabled
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
            disabled
            label="traffic"
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
            disabled={request.start !== null}
            options={data}
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
            disabled={request.end !== null}
            options={data}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => <TextField {...params} label="End" />}
            onChange={(e, value) =>
              setRequest({
                ...request,
                end: value,
              })
            }
          />
          <Button color="inherit" onClick={toggleDrawer(true)}>
            show table
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer anchor={"top"} open={open} onClose={toggleDrawer(false)}>
        {arg}
      </Drawer>
      <TMap
        data={data}
        calculate={request}
        on={(runing) => setRuning(runing)}
      />
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={runing}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );

  // return (
  //   <Root>
  //     <CssBaseline />
  //     <Global
  //       styles={{
  //         ".MuiDrawer-root > .MuiPaper-root": {
  //           height: `calc(90% - ${drawerBleeding}px)`,
  //           overflow: "visible",
  //         },
  //       }}
  //     />
  //     <TMap data={data} calculate={request} />
  //     <Box sx={{ textAlign: "center", pt: 1 }}>
  //       <Button onClick={toggleDrawer(true)}>Open</Button>
  //     </Box>
  //     <SwipeableDrawer
  //       container={container}
  //       anchor="bottom"
  //       open={open}
  //       onClose={toggleDrawer(false)}
  //       onOpen={toggleDrawer(true)}
  //       swipeAreaWidth={drawerBleeding}
  //       disableSwipeToOpen={false}
  //       ModalProps={{
  //         keepMounted: true,
  //       }}
  //     >
  //       <StyledBox
  //         sx={{
  //           position: "absolute",
  //           top: -drawerBleeding,
  //           borderTopLeftRadius: 8,
  //           borderTopRightRadius: 8,
  //           visibility: "visible",
  //           right: 0,
  //           left: 0,
  //         }}
  //       >
  //         <Grid container spacing={2}>
  //           <Grid item xs={2}>
  //             {arg}
  //           </Grid>
  //           <Grid item xs={10}>
  //             <DataGrid rows={data ?? []} columns={columns} />
  //           </Grid>
  //         </Grid>
  //       </StyledBox>
  //     </SwipeableDrawer>
  //   </Root>
  // );
}

export default App;
