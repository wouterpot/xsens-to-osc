import "./App.css";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  TableFooter,
  TablePagination,
  TableContainer,
  Select,
  MenuItem,
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
        Header: "Sensor",
        accessor: "sensor"
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
        Header: "Offset",
        accessor: "offset"
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
    server.post("/config", config)
    console.log(`updated config to:\n ${JSON.stringify(config)}`)
  }, [config]);


  const {
    getTableProps,
    headerGroups,
    page,
    prepareRow,
    state: { pageIndex, pageSize },
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
    if (!value) {
      return
    }
    console.log(`updating ${property} of row ${row} from ${config[row][property]} to ${value}`)
    config[row][property] = value
    setConfig([...config]);
  };

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
            {page.map((row, i) => {
              prepareRow(row);
              return (

                <TableRow key={i} {...row.getRowProps()}>
                  <TableCell key="0">
                    <Select value={config[i]?.sensor} onChange={((e) => updateColumn('sensor',e.target.value, i))}>
                      {
                        sensors.map((sensor, k) =>
                          <MenuItem value={sensor} key={k}>{sensor}</MenuItem>
                        )
                      }
                    </Select>
                  </TableCell>

                  <TableCell key="1">
                    <input type="number" name="channel" value={config[i]?.channel} onChange={((e) => updateColumn('channel',e.target.value, i))} />
                  </TableCell>

                  <TableCell key="2">
                    <Select value={config[i]?.dimension} onChange={((e) => updateColumn('dimension',e.target.value, i))}>
                      {
                        dimensions.map((dimension, k) =>
                          <MenuItem value={dimension} key={k}>{dimension}</MenuItem>
                        )
                      }
                    </Select>
                  </TableCell>

                  <TableCell key="3">
                    <input type="number" name="skip" value={config[i]?.skip || 0 } onChange={((e) => updateColumn('skip',e.target.value, i))}/>
                  </TableCell>

                  <TableCell key="4">
                    <input type="number" name="offset" value={config[i]?.offset || 0 } onChange={((e) => updateColumn('offset',e.target.value, i))}/>
                  </TableCell>

                  <TableCell key="5">
                    <input type="number" name="velocity" value={config[i]?.velocity || 0 } onChange={((e) => updateColumn('velocity',e.target.value, i))}/>
                  </TableCell>

                  <TableCell key="6">
                    <input type="number" name="treshold" value={config[i]?.treshold || 0 } onChange={((e) => updateColumn('treshold',e.target.value, i))}/>
                  </TableCell>

                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[
                  23,
                  { label: "All", value: config.length },
                ]}
                colSpan={3}
                count={config.length}
                rowsPerPage={pageSize}
                page={pageIndex}
                SelectProps={{
                  inputProps: { "aria-label": "rows per page" },
                  native: true,
                }}
              />
            </TableRow>
          </TableFooter>
        </MaUTable>
      </TableContainer>
    </div>
  );
}

export default App;
