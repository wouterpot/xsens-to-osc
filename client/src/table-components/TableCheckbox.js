import { Checkbox } from "@mui/material";

export function TableCheckbox({ value, row, column, updateColumn }) {
  return <Checkbox checked={value === true} onChange={((e, value) => updateColumn(row.index, column.id, value))} />;
}
