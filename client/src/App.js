import "./App.css";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  TableFooter,
  TablePagination,
  TableContainer,
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
  const [segments, setSegments] = useState([]);

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
    server.get("/config").then((body) => setSegments(body.data.config)
    );
  }, []);

  const {
    getTableProps,
    headerGroups,
    page,
    prepareRow,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data: segments,
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
                  {row.cells.map((cell, j) => {
                    return (
                      <TableCell key={j} {...cell.getCellProps()}>
                        {cell.render("Cell")}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[
                  23,
                  { label: "All", value: segments.length },
                ]}
                colSpan={3}
                count={segments.length}
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
