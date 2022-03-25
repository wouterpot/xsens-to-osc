import "./App.css";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  TableFooter,
  TablePagination,
  TableContainer,
  Select,
  MenuItem,
  Button,
  Slider,
  Checkbox
} from "@material-ui/core";
import MaUTable from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import server from "./server";

import {
  useTable,
  useRowSelect,
  usePagination,
  useFilters,
  useSortBy,
} from "react-table";

function App() {
  const [config, setConfig] = useState([]);
  const [sensors, setSensors] = useState([]);
  const dimensions = ["posX", "posY", "posZ"]

  const columns = useMemo(
    () => [
      {
        Header: "Enabled",
        accessor: "enabled"
      },
      {
        Header: "Sensor",
        accessor: "sensor"
      },
      {
        Header: "Action",
        accessor: "action"
      },
      {
        Header: "Channel",
        accessor: "channel"
      },
      {
        Header: "Dimension",
        accessor: "dimension"
      },
      {
        Header: "Skip",
        accessor: "skip"
      },
      {
        Header: "Velocity",
        accessor: "velocity"
      },
      {
        Header: "Threshold",
        accessor: "threshold"
      }
    ],
    []
  );

  useEffect(() => {
    server.get("/config").then((body) => {
      setSensors(body.data.segments)
      setConfig(body.data.config)
    }
    );
  }, []);

  useEffect(() => {
    server.post("/config", config.filter((obj) => obj.enabled))
    console.log(`updated config to:\n ${JSON.stringify(config, null, 2)}`)
  }, [config]);


  const {
    getTableProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data: config,
      initialState: {
        pageSize: 23,
      },
      getRowId: useCallback((row) => row.sensor, []),
    },
    useFilters,
    useSortBy,
    usePagination,
    useRowSelect
  );

  const updateColumn = (property, value, row) => {
    console.log(`updating ${property} of row ${row} from ${config[row][property]} to ${value}`)
    config[row][property] = value
    setConfig([...config]);
  };

  const addRow = () => {
    console.log(`Adding another row`)
    const available = sensors.filter(s => !config.map(c => c.sensor).includes(s))
    setConfig([...config, { 
      enabled: true,
      channel: 0,
      dimension: "posX",
      skip: 1,
      multiply: 10,
      sensor: available[0], 
      action: "cc",
      cc: 1
    }]);
  }

  return (
    <div className="App">
      <TableContainer>
        <MaUTable {...getTableProps()} >
          <TableHead>
            {headerGroups.map((headerGroup, i) => (
              <TableRow key={i} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, j) => (
                  <TableCell
                    key={j}
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                  >
                    {column.render(`Header`)}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? " 🔽"
                          : " 🔼"
                        : ""}
                    </span>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {rows.map((row, i) => {
              prepareRow(row);
              return (

                <TableRow key={i} {...row.getRowProps()}>
                  <TableCell key="0">
                    <Checkbox checked={config[i]?.enabled == true} onChange={((e, value) => updateColumn('enabled', value, i))}/>
                  </TableCell>
                  <TableCell key="1">
                    <Select value={config[i]?.sensor || 'Head'} onChange={((e) => updateColumn('sensor', e.target.value, i))}>
                      {
                        sensors.map((sensor, k) =>
                          <MenuItem value={sensor} key={k}>{sensor}</MenuItem>
                        )
                      }
                    </Select>
                  </TableCell>

                  <TableCell key="2">
                    <Select value={config[i]?.action} onChange={((e) => updateColumn('action', e.target.value, i))}>
                      {
                        ["midi", "pitch", "cc"].map((action, k) =>
                          <MenuItem value={action} key={k}>{action}</MenuItem>
                        )
                      }
                    </Select>
                    {
                      config[i]?.action == "cc" && <input min={1} max={127} type="number" name="cc" value={config[i]?.cc || 0} onChange={((e) => updateColumn('cc', e.target.value, i))} />
                    }

                  </TableCell>


                  <TableCell key="3">
                    <input min={1} max={127} type="number" name="channel" value={config[i]?.channel} onChange={((e) => updateColumn('channel', e.target.value, i))} />
                  </TableCell>

                  <TableCell key="4">
                    <Select value={config[i]?.dimension || 'posX'} onChange={((e) => updateColumn('dimension', e.target.value, i))}>
                      {
                        dimensions.map((dimension, k) =>
                          <MenuItem value={dimension} key={k}>{dimension}</MenuItem>
                        )
                      }
                    </Select>
                  </TableCell>

                  <TableCell key="5">
                    <Slider min={1} max={200} value={config[i]?.skip || 0} onChange={((e, value) => updateColumn('skip', value, i))} />
                  </TableCell>

                  <TableCell key="6">
                    <Slider min={0} max={127} value={config[i]?.velocity || 0} onChange={((_, value) => updateColumn('velocity', value, i))} />
                  </TableCell>

                  <TableCell key="7">
                    <input type="number" name="treshold" value={config[i]?.treshold || 0} onChange={((e) => updateColumn('treshold', e.target.value, i))} />
                  </TableCell>

                </TableRow>
              );
            })}
          </TableBody>
          <Button onClick={() => addRow()}>+</Button>
        </MaUTable>
      </TableContainer>
    </div>
  );
}

export default App;
