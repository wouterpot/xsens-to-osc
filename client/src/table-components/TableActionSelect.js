import {
  Select,
  MenuItem, Stack, TextField
} from "@mui/material";

export function TableActionSelect({ value, row, column, updateColumn, config }) {
  return <Stack spacing={1} direction="row" alignItems="center">
    <Select size='small' value={value} onChange={((e) => updateColumn(row.index, column.id, e.target.value))}>
      {["midi", "pitch", "cc"].map((action, k) => <MenuItem value={action} key={k}>{action}</MenuItem>
      )}
    </Select>
    {value === "cc" ? <TextField inputProps={{ min: 0, max: 127 }} type="number" name="cc" size='small' value={config[row.index]?.cc || 0} onChange={((e) => updateColumn(row.index, 'cc', e.target.value))} /> : null}
  </Stack>;

}
