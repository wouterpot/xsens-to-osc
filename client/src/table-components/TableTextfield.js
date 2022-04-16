import { TextField } from "@mui/material";

export function TableTextfield({ value, row, column, updateColumn }) {
  return <TextField size='small' inputProps={{ min: 0, max: 15 }} type="number" name="channel" value={value || 0} onChange={((e) => updateColumn(row.index, column.id, e.target.value))} />;
}
