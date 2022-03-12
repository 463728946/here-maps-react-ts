import {
  AppBar,
  Autocomplete,
  Box,
  Grid,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import CSVReader from "react-csv-reader";
import { useState } from "react";
import TMap, { IData } from "./TMap";

function App() {
  const [data, setData] = useState<IData[]>([]);
  // const [calculate, setCalculate] = useState<boolean>(false);
  const [start, setStart] = useState<IData | null>(null);
  const [end, setEnd] = useState<IData | null>(null);
  // const [disabled, setDisabled] = useState<boolean>(false);
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
    console.log(data);

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

  // const handleOnClick = () => setCalculate(true);

  // useEffect(() => {
  //   console.log("start:", start);
  //   console.log("end:", end);
  //   if (start === null || end === null) {
  //     setDisabled(true);
  //   } else {
  //     setDisabled(false);
  //   }
  // }, [start, end]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TMap data={data} calculate={{ start: start, end: end }} />
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <CSVReader onFileLoaded={handleonFileLoaded} />
              <Autocomplete
                value={start}
                options={data}
                getOptionLabel={(option) => option.name}
                size="small"
                fullWidth
                renderInput={(params) => (
                  <TextField {...params} label="Start" />
                )}
                onChange={(e, value) => setStart(value)}
              />
              <Autocomplete
                value={end}
                options={data}
                getOptionLabel={(option) => option.name}
                size="small"
                fullWidth
                renderInput={(params) => <TextField {...params} label="End" />}
                onChange={(e, value) => setEnd(value)}
              />
              <Typography
                variant="h6"
                component="div"
                sx={{ flexGrow: 1 }}
              ></Typography>
              {/* <Button
                disabled={disabled}
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={handleOnClick}
              >
                calculate
              </Button> */}
            </Toolbar>
          </AppBar>
          <div style={{ height: 600, width: "100%" }}>
            <DataGrid rows={data ?? []} columns={columns} />
          </div>
        </Box>
      </Grid>
    </Grid>
  );
}

export default App;

// <HMapMarker position={{ lat: 1, lng: 1 }} />
//             <HMapMarker position={{ lat: 41.9, lng: 12.5 }} />
//             <HPolygon
//               points={[
//                 51.2, 21.51, 0, 51.2, 25.6, 0, 49.2, 25.9, 0, 48.7, 22.5, 0,
//                 49.9, 24, 0, 50.5, 24, 0,
//               ]}
//               options={{
//                 data: null,
//                 style: {
//                   fillColor: "rgba(150, 100, 0, .3)", //"#FFFFCC",
//                   //strokeColor: "#829",
//                   lineWidth: 0,
//                 },
//               }}
//             ></HPolygon>
