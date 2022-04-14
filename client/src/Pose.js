import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import server from "./server";

function Pose() {
    const [segments, setSegments] = useState([]);

    const getPose = () =>
        server
            .get("/pose")
            .then(({ data } = {}) => setSegments(data?.lastPacket?.segments ?? []));

    useEffect(() => {
        getPose();
        setInterval(getPose, 10);
    }, []);

    return (
        <Plot
            data={[
                {
                    x: segments.map((s) => s.posX),
                    y: segments.map((s) => s.posY),
                    z: segments.map((s) => s.posZ),
                    text: segments.map((s) => s.name),
                    fillColor: ["red", "green"],
                    mode: "markers+text",
                    type: "scatter3d",
                    marker: {
                        color: segments.map((s) =>
                            s.active ? "green" : "red"
                        ),
                    },
                },
            ]}
            layout={{
                width: 1200,
                height: 1200,

                title: "Sensor positions",
                scene: {
                    aspectmode: "cube",
                    aspectratio: { x: 1, z: 1 },

                    camera: { up: { x: 0, y: 1, z: 0 } },
                    xaxis: { autorange: false, range: [0, 150] },
                    yaxis: {
                        autorange: false,
                        range: [0.0, 250.0],
                    },
                    zaxis: {
                        autorange: false,
                        aspectmode: 1,
                        range: [-100.0, 150.0],
                    },
                },
            }}
        />
    );
}

export default Pose;
