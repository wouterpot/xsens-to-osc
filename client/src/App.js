import "./App.css";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  TableContainer,
  Select,
  MenuItem,
  Button,
  Slider,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";
import MaUTable from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { ToggleButton } from '@material-ui/lab'
import server, { getServerUrl } from "./server";
import {
  useTable,
  useRowSelect,
  usePagination,
  useFilters,
  useSortBy,
} from "react-table";

const dimensions = ["posX", "posY", "posZ"]

function App() {
  const [config, setConfig] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [sendEuler, setSendEuler] = useState(true);
  const [sendQuaternion, setSendQuaternion] = useState(false);
  const [isCalibratingAll, setIsCalibratingAll] = useState(false);
  const [isCalibratingActive, setIsCalibratingActive] = useState(false);

  const updateColumn = useCallback((property, value, row) => {
    console.log(`updating ${property} of row ${row} from ${config[row][property]} to ${value}`)
    config[row][property] = value
    setConfig([...config]);
  }, [config, setConfig]);

  const columns = useMemo(
    () => [
      {
        Header: "Enabled",
        accessor: "enabled",
        Cell: ({ value, row }) => <Checkbox checked={value === true} onChange={((e, value) => updateColumn('enabled', value, row.index))} />
      },
      {
        Header: "Sensor",
        accessor: "sensor",
        Cell: ({ value, row }) => <Select value={value || 'Head'} onChange={((e) => updateColumn('sensor', e.target.value, row.index))}>
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
        Cell: ({ value, row }) => <>
          <Select value={value} onChange={((e) => updateColumn('action', e.target.value, row.index))}>
            {
              ["midi", "pitch", "cc"].map((action, k) =>
                <MenuItem value={action} key={k}>{action}</MenuItem>
              )
            }
          </Select>
          {
            value === "cc" && <input min={1} max={127} type="number" name="cc" value={config[row.index]?.cc || 0} onChange={((e) => updateColumn('cc', e.target.value, row.index))} />
          }
        </>
      },
      {
        Header: "Channel",
        accessor: "channel",
        Cell: ({ value, row }) => <input min={1} max={127} type="number" name="channel" value={value} onChange={((e) => updateColumn('channel', e.target.value, row.index))} />
      },
      {
        Header: "Dimension",
        accessor: "dimension",
        Cell: ({ value, row }) => <Select value={value || 'posX'} onChange={((e) => updateColumn('dimension', e.target.value, row.index))}>
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
        Cell: ({ value, row }) => <Slider valueLabelDisplay="auto" min={1} max={200} value={value || 0} onChange={((e, value) => updateColumn('skip', value, row.index))} />
      },
      {
        Header: "Velocity",
        accessor: "velocity",
        Cell: ({ value, row }) => <Slider valueLabelDisplay="auto" min={0} max={127} value={value || 0} onChange={((_, value) => updateColumn('velocity', value, row.index))} />
      },
      {
        Header: "Threshold",
        accessor: "threshold",
        Cell: ({ value, row }) => <input type="number" name="treshold" value={value || 0} onChange={((e) => updateColumn('treshold', e.target.value, row.index))} />
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
    <div className="App">
      <FormControlLabel control={<Checkbox checked={sendEuler} onChange={(e, checked) => toggleDatagrams(checked, sendQuaternion)} />} label="Euler Datagram (MXTP01)" />
      <FormControlLabel control={<Checkbox checked={sendQuaternion} onChange={(e, checked) => toggleDatagrams(sendEuler, checked)} />} label="Quaternion Datagram (MXTP02)" />
      <ToggleButton
        value="check"
        selected={isCalibratingAll}
        onClick={() => toggleCalibration(!isCalibratingAll, false)}
      >
        Calibrate all
      </ToggleButton>
      <ToggleButton
        value="check"
        selected={isCalibratingActive}
        onClick={() => toggleCalibration(false, !isCalibratingActive)}
      >
        Calibrate active
      </ToggleButton>
      <Button
        onClick={() => window.open('/pose')}
      >
        Pose
      </Button>
      <Button
        onClick={() => window.open(`${getServerUrl()}/pose/calibration`)}
      >
        Show calibration
      </Button>

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
        </MaUTable>
      </TableContainer>
    </div>
  );

}

export default App;
