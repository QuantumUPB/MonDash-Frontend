import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { AutoRefreshContext } from "./AutoRefreshContext";
import NodeDevicesMap from "./NodeDevicesMap";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const DEFAULT_NUM_ENTRIES = 15;

const DeviceList = () => {
  const [devices, setDevices] = useState([]);
  // keyRateHistory stores an array of { timestamp, rate } for each device
  const [keyRateHistory, setKeyRateHistory] = useState({});
  const { refreshTrigger } = useContext(AutoRefreshContext);
  const router = useRouter();

  useEffect(() => {
    axios
      .get(`/api/devices?numEntries=${DEFAULT_NUM_ENTRIES}`)
      .then((res) => {
        setDevices(res.data);
        const history = {};
        res.data.forEach((dev) => {
          if (Array.isArray(dev.self_reporting?.keyrate)) {
            history[dev.id] = dev.self_reporting.keyrate.map((h) => ({
              timestamp: h.timestamp,
              rate: h.rate,
            }));
          } else if (Array.isArray(dev.self_reporting?.key_rate_history)) {
            history[dev.id] = dev.self_reporting.key_rate_history.map((h) => ({
              timestamp: h.timestamp,
              rate: h.rate,
            }));
          } else if (dev.self_reporting?.key_rate !== undefined) {
            const rate = dev.self_reporting.key_rate;
            const entry = { timestamp: new Date().toISOString(), rate };
            history[dev.id] = [entry];
          } else {
            history[dev.id] = [];
          }
        });
        setKeyRateHistory(history);
      })
      .catch((err) => console.error("Failed to fetch devices:", err));
  }, [refreshTrigger]);

  const [highlightDevice, setHighlightDevice] = useState(null);
  const [mapNodes, setMapNodes] = useState([]);
  const [mapConnections, setMapConnections] = useState([]);
  const [nodeDevices, setNodeDevices] = useState([]);
  const [mapNode, setMapNode] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [highlightMapDevice, setHighlightMapDevice] = useState(null);
  const deviceRefs = useRef({}); // Refs for each device element

  const groupedDevices = useMemo(() => {
    return devices.reduce((acc, dev) => {
      const node = dev.node_id || "Unknown";
      if (!acc[node]) acc[node] = [];
      acc[node].push(dev);
      return acc;
    }, {});
  }, [devices]);

  const handleSetAlert = (deviceName) => {
    router.push({
      pathname: "/alerts",
      query: { device: deviceName },
    });
  };

  const handleViewOnMap = async (device) => {
    setHighlightMapDevice(device.id);
    try {
      const mapRes = await axios.get("/api/map");
      const fetchedNodes = mapRes.data.nodes.map((n) => ({
        ...n,
        coordinates: Array.isArray(n.coordinates)
          ? n.coordinates
          : [n.coordinates.long, n.coordinates.lat],
        endpoint: Boolean(n.endpoint),
      }));
      setMapNodes(fetchedNodes);
      setMapConnections(mapRes.data.connections);
      const node = fetchedNodes.find(
        (n) => n.id === device.node_id || n.name === device.node_id,
      );
      setMapNode(node);
      const devRes = await axios.get(`/api/devices?node=${device.node_id}`);
      const filtered = Array.isArray(devRes.data)
        ? devRes.data.filter((d) => d.node_id === device.node_id)
        : [];
      setNodeDevices(filtered);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to open map:", err);
    }
  };

  const renderKeyRateChart = (deviceId) => {
    const history = keyRateHistory[deviceId] || [];
    const data = {
      labels: history.map((entry) =>
        new Date(entry.timestamp).toLocaleTimeString(),
      ),
      datasets: [
        {
          label: "Key Rate",
          data: history.map((entry) => entry.rate),
          borderColor: "#4caf50",
          backgroundColor: "#4caf50",
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "Key Rate Over Time",
        },
      },
    };

    return (
      <div className="key-rate-chart">
        <Line data={data} options={options} />
      </div>
    );
  };

  const handleConnectedClick = (deviceId) => {
    // Scroll to the connected device and highlight it
    const targetDevice = deviceRefs.current[deviceId];
    if (targetDevice) {
      targetDevice.scrollIntoView({ behavior: "smooth", block: "center" });

      // Highlight the device
      setHighlightDevice(deviceId);
      setTimeout(() => setHighlightDevice(null), 2000); // Remove highlight after 2 seconds
    }
  };

  return (
    <div className="device-list-container">
      <h1 className="device-list-title">Device List</h1>
      <div className="device-list">
        {Object.entries(groupedDevices).map(([nodeId, nodeDevices]) => (
          <div key={nodeId} className="node-group">
            <h2 className="node-group-title">Node {nodeId}</h2>
            {nodeDevices.map((device) => (
              <div
                key={device.id}
                ref={(el) => (deviceRefs.current[device.id] = el)}
                className={`device-card ${
                  highlightDevice === device.id ? "highlight" : ""
                } ${device.status ? device.status.toLowerCase() : ""}`}
              >
                <div className="device-card-header">
                  <h2>{device.id}</h2>
                  <p>
                    Status:{" "}
                    <span
                      className={`status-badge ${device.status.toLowerCase()}`}
                    >
                      {device.status}
                    </span>
                  </p>
                </div>
                <div className="device-card-body">
                  <div className="device-details">
                    <p>Device: {device.device}</p>
                    <p>
                      Node:{" "}
                      <a
                        href="#"
                        className="device-node-link"
                        onClick={(e) => {
                          e.preventDefault();
                          router.push({
                            pathname: "/nodes",
                            query: { node: device.node_id },
                          });
                        }}
                      >
                        {device.node_id}
                      </a>
                    </p>
                    <p>
                      Connected to:{" "}
                      <a
                        href="#"
                        className="device-connected-link"
                        onClick={() =>
                          handleConnectedClick(device.connected_to.id)
                        }
                      >
                        {device.connected_to.id}
                      </a>
                    </p>
                  </div>
                  <div className="device-key-rate">
                    {renderKeyRateChart(device.id)}
                    <p className="key-rate-text">
                      Keyrate:
                      <br />
                      {
                        (keyRateHistory[device.id] &&
                          keyRateHistory[device.id][keyRateHistory[device.id].length - 1]?.rate) ??
                        device.self_reporting.key_rate ?? 0
                      } bps
                    </p>
                  </div>
                </div>
                <div className="device-card-footer">
                  <button
                    className="device-action-btn map-btn"
                    onClick={() => handleViewOnMap(device)}
                  >
                    Show on Map
                  </button>
                  <button
                    className="device-action-btn alert-btn"
                    onClick={() => handleSetAlert(device.device)}
                  >
                    Set Alert
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {showModal && mapNode && (
        <NodeDevicesMap
          devices={nodeDevices}
          node={mapNode}
          nodes={mapNodes}
          connections={mapConnections}
          onClose={() => setShowModal(false)}
          highlightDevice={highlightMapDevice}
        />
      )}
    </div>
  );
};

export default DeviceList;
