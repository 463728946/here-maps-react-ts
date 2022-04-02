import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  DialogContent,
} from "@mui/material";

import React, { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";

export interface ColorDialogProps {
  title?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function ColorDialog(props: ColorDialogProps) {
  const { value, title } = props;
  const [color, setColor] = useState("#b32aa9");
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    setOpen(title !== undefined);
  }, [title]);

  useEffect(() => {
    setColor(value);
  }, [value]);

  const handleOk = () => {};

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Set backup account</DialogTitle>
      <DialogContent>
        <HexColorPicker color={color} onChange={setColor} />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleOk}>
          Ok
        </Button>
        <Button variant="contained" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
