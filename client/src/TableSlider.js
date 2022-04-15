import { useState, useEffect } from "react";
import { Slider } from "@mui/material";

const minValues = {
    skip: 1,
    velocity: 0,
    threshold: 0
}

const maxValues = {
    skip: 200,
    velocity: 127,
    threshold: 200
}

export function TableSlider({ value: initialValue, row, column, updateColumn }) {
    const [value, setValue] = useState(initialValue);

    useEffect(() => updateColumn(row.index, column.id, value), [value, row.index, column.id, updateColumn]);

    return <Slider size='small' valueLabelDisplay="auto" min={minValues[column.id]} max={maxValues[column.id]} value={initialValue} onChange={(_e, val) => setValue(val)} />;
}
