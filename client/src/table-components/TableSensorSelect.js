import {
    Select,
    MenuItem
} from "@mui/material";

export function TableSensorSelect({ value, row, column, updateColumn, sensors }) {
    return <Select size='small' value={value || column.name} onChange={((e) => updateColumn(row.index, column.id, e.target.value))}>
        {sensors.map((sensor, k) => <MenuItem value={sensor} key={k}>{sensor}</MenuItem>)}
    </Select>;
}
