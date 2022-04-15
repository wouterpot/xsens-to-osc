import "./App.css";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  TableContainer,
  Select,
  MenuItem,
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
import { TableSlider } from "./TableSlider";

const dimensions = ["posX", "posY", "posZ"]

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
        Cell: ({ value, row }) => <Checkbox checked={value === true} onChange={((e, value) => updateColumn(row.index, 'enabled', value))} />
      },
      {
        Header: "Sensor",
        accessor: "sensor",
        Cell: ({ value, row }) => <Select size='small' value={value || 'Head'} onChange={((e) => updateColumn(row.index, 'sensor', e.target.value))}>
          {
            sensors.map((sensor, k) =>
              <MenuItem value={sensor} key={k}>{sensor}</MenuItem>
            )
          }
        </Select>
      },
      {
        Header: "Action",
        accessor: "action",
        Cell: ({ value, row }) => <Stack spacing={1} direction="row" alignItems="center">
          <Select size='small' value={value} onChange={((e) => updateColumn(row.index, 'action', e.target.value))}>
            {
              ["midi", "pitch", "cc"].map((action, k) =>
                <MenuItem value={action} key={k}>{action}</MenuItem>
              )
            }
          </Select>
          {
            value === "cc" && <input min={1} max={127} type="number" name="cc" value={config[row.index]?.cc || 0} onChange={((e) => updateColumn(row.index, 'cc', e.target.value))} />
          }
        </Stack>
      },
      {
        Header: "Channel",
        accessor: "channel",
        Cell: ({ value, row }) => <input min={0} max={127} type="number" name="channel" value={value || 0} onChange={((e) => updateColumn(row.index, 'channel', e.target.value))} />
      },
      {
        Header: "Dimension",
        accessor: "dimension",
        Cell: ({ value, row }) => <Select size='small' value={value || 'posX'} onChange={((e) => updateColumn(row.index, 'dimension', e.target.value))}>
          {
            dimensions.map((dimension, k) =>
              <MenuItem value={dimension} key={k}>{dimension}</MenuItem>
            )
          }
        </Select>
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
        Header: "Threshold",
        accessor: "threshold",
        Cell: TableSlider
      }
    ],
    [config, sensors, updateColumn]
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
      updateColumn
    },
    useFilters,
    useSortBy,
    usePagination,
    useRowSelect
  );

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

  async function getCalibration() {
    const str = window.localStorage.getItem('calibration');
    if (str) {
      const calibration = JSON.parse(str);
      if (calibration) await server.post(`/pose/calibration`, calibration);
    }
  }

  useEffect(() => { getCalibration() }, [])

  const toggleCalibration = async (all, active) => {
    console.log(`Calibrate all: ${all}; Calibrate active: ${active}`)
    setIsCalibratingAll(all)
    setIsCalibratingActive(active)
    const { data: calibration } = (await server.post(`/pose/toggle-calibration`, { all, active })) || {}
    if (!all && !active) {
      window.localStorage.setItem('calibration', JSON.stringify(calibration))
    }
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
          onClick={() => window.localStorage.removeItem('calibration')}
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
          <Button onClick={() => addRow()}>+</Button>
        </Table>
      </TableContainer>
    </Stack>

  );

}

export default App;
