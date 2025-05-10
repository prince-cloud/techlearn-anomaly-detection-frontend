import React from 'react'
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps {
  label: string;
  options: SelectOption[];
  id: string;
  value: string;
  onChange: (event: SelectChangeEvent) => void;
}

export default function SelectBox({ label, options, id, value, onChange }: SelectProps) {
  return (
    <FormControl style={{ marginBottom: "1em" }} className="select-box" fullWidth>
      <InputLabel id={label}>{label}</InputLabel>
      <Select
        labelId={label}
        id={id}
        value={value}
        onChange={onChange}
        sx={{
          "& .MuiSvgIcon-root": {
            width: 'auto',
          },
        }}
      >
        {options.map((item, index) => (
          <MenuItem key={index} value={item.value}>{item.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
