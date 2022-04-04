import { Box, Button, Paper, Stack, styled, Typography } from "@mui/material";
import { useState } from "react";
import ArcgisMap from "./ArcgisMap";
import TMap from "./TMap";

function App() {
  const [demo, setDemo] = useState<"here" | "arc" | "">("");

  const box = (
    <Box mt={"10%"} ml={"30%"} mr={"30%"}>
      <Stack spacing={2}>
        <Button
          variant="outlined"
          sx={{ height: 100 }}
          onClick={() => setDemo("here")}
        >
          Here
        </Button>
        <Button
          variant="outlined"
          sx={{ height: 100 }}
          onClick={() => setDemo("arc")}
        >
          Arcgis
        </Button>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      {demo === "" ? box : demo === "here" ? <TMap /> : <ArcgisMap />}
    </Box>
  );
}
export default App;
