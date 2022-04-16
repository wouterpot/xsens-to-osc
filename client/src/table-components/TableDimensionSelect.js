import {
  Select,
  MenuItem
} from "@mui/material";
import { dimensions } from "../App";

export function TableDimensionSelect({ value, row, column, updateColumn }) {
  return <Select size='small' value={value || 'posX'} onChange={((e) => updateColumn(row.index, column.id, e.target.value))}>
    {dimensions.map((dimension, k) => <MenuItem value={dimension} key={k}>{dimension}</MenuItem>
    )}
  </Select>;
}
