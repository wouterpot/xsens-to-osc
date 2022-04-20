import "./App.css";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  TableContainer,
  Checkbox,
  FormControlLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  Stack
} from "@mui/material";
import server, { getServerUrl } from "./server";
import {
  useTable,
  useRowSelect,
  usePagination,
  useFilters,
  useSortBy,
} from "react-table";
import { TableSlider, TableSensorSelect, TableActionSelect, TableCheckbox, TableDimensionSelect } from "./table-components";
import { TableTextfield } from "./table-components/TableTextfield";

export const dimensions = ["posX", "posY", "posZ"]

function App() {
  const [config, setConfig] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [sendEuler, setSendEuler] = useState(true);
  const [sendQuaternion, setSendQuaternion] = useState(false);
  const [isCalibratingAll, setIsCalibratingAll] = useState(false);
  const [isCalibratingActive, setIsCalibratingActive] = useState(false);

  const updateColumn = useCallback((row, col, value) => {
    setConfig(config => {
      config[row][col] = value
      return [...config]
    }
    );
  }, [setConfig]);

  const columns = useMemo(
    () => [
      {
        Header: "Enabled",
        accessor: "enabled",
        Cell: TableCheckbox
      },
      {
        Header: "Sensor",
        accessor: "sensor",
        Cell: TableSensorSelect
      },
      {
        Header: "Action",
        accessor: "action",
        Cell: TableActionSelect
      },
      {
        Header: "Channel",
        accessor: "channel",
        Cell: TableTextfield
      },
      {
        Header: "Dimension",
        accessor: "dimension",
        Cell: TableDimensionSelect
      },
      {
        Header: "Skip",
        accessor: "skip",
        Cell: TableSlider
      },
      {
        Header: "Velocity",
        accessor: "velocity",
        Cell: TableSlider
      },
      {
        Header: "Inverted",
        accessor: "inverted",
        Cell: TableCheckbox
      },
    ],
    []
  );

  const init = ({ data: { segments, config } }) => {
    setSensors(segments)
    setConfig(config)
  }

  useEffect(() => {
    const getConfig = async () => {
      server.get("/config").then(init)
    }

    getConfig()
  }, [setConfig, setSensors]);

  useEffect(() => {
    if (config.length !== 0) server.post("/config", config)
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
      getRowId: useCallback((row, i) => `${row.sensor}_${i}`, []),
      updateColumn, sensors, config
    },
    useFilters,
    useSortBy,
    usePagination,
    useRowSelect
  );

  const addRow = () => {
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


  const toggleCalibration = async (all, active) => {
    console.log(`Calibrate all: ${all}; Calibrate active: ${active}`)
    setIsCalibratingAll(all)
    setIsCalibratingActive(active)
    server.post(`/pose/toggle-calibration`, { all, active })
  }

  const toggleDatagrams = (sendEuler, sendQuaternion) => {
    setSendEuler(sendEuler)
    setSendQuaternion(sendQuaternion)
    server.post('/pose/datagram-type', { sendEuler, sendQuaternion })
  }

  return (
    <Stack padding={2}>

      <Stack className="App" spacing={1} direction="row" alignItems="center">
        <FormControlLabel size='small' control={<Checkbox size='small' checked={sendEuler} onChange={(e, checked) => toggleDatagrams(checked, sendQuaternion)} />} label="Euler (MXTP01)" />
        <FormControlLabel size='small' control={<Checkbox size='small' checked={sendQuaternion} onChange={(e, checked) => toggleDatagrams(sendEuler, checked)} />} label="Quat (MXTP02)" />
        <ToggleButton size="small" variant="contained" color="primary"
          value="check"
          selected={isCalibratingAll}
          onClick={() => toggleCalibration(!isCalibratingAll, false)}
        >
          Calibrate all
        </ToggleButton>
        <ToggleButton size="small" variant="contained" color="primary"
          value="check"
          selected={isCalibratingActive}
          onClick={() => toggleCalibration(false, !isCalibratingActive)}
        >
          Calibrate active
        </ToggleButton>
        <Button size='small' variant="contained" color="primary"
          onClick={() => window.open(`${getServerUrl()}/pose/calibration`)}
        >
          Show calibration
        </Button>
        <Button size='small' variant="contained" color="primary"
          onClick={() => {
            server.delete('/pose/calibration')
          }}
        >
          Reset calibration
        </Button>
        <Button size="small" variant="contained" color="primary"
          onClick={() => window.open('/pose')}
        >
          Pose
        </Button>
        <Button size='small' variant="contained" color="primary"
          onClick={() => window.open(`${getServerUrl()}/config`)}
        >
          Show config
        </Button>
      </Stack>

      <TableContainer>
        <Table {...getTableProps()} >
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
                <TableRow
                  key={i}
                  {...row.getRowProps()}
                >
                  {row.cells.map((cell, j) => {
                    return (
                      <TableCell key={j} {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </TableCell>
                    )
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Button onClick={() => addRow()}>+</Button>
    </Stack>

  );

}

export default App;
