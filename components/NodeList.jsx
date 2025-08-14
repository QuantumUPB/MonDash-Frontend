import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { AutoRefreshContext } from "./AutoRefreshContext";
import NodeDevicesMap from "./NodeDevicesMap";

const roundToThreeMinutes = (val) => Math.round(val * 20) / 20;

const NodeList = () => {
  const router = useRouter();
  const [nodes, setNodes] = useState([]);
  const [highlighted, setHighlighted] = useState(null);
  const [mapNodes, setMapNodes] = useState([]);
  const [mapConnections, setMapConnections] = useState([]);
  const [nodeDevices, setNodeDevices] = useState([]);
  const [mapNode, setMapNode] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [highlightMapNode, setHighlightMapNode] = useState(null);
  const [devicesByNode, setDevicesByNode] = useState({});
  const nodeRefs = useRef({});
  const { refreshTrigger } = useContext(AutoRefreshContext);

  const handleNodeClick = (nodeId) => {
    const target = nodeRefs.current[nodeId];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });

      // Highlight the device
      setHighlighted(nodeId);
      setTimeout(() => setHighlighted(null), 2000); // Remove highlight after 2 seconds
    }
  };

  const handleViewOnMap = async (n) => {
    setHighlightMapNode(n.id);
    try {
      const mapRes = await axios.get("/api/map");
      const fetchedNodes = mapRes.data.nodes.map((mn) => ({
        ...mn,
        coordinates: Array.isArray(mn.coordinates)
          ? mn.coordinates
          : [mn.coordinates.long, mn.coordinates.lat],
        endpoint: Boolean(mn.endpoint),
      }));
      setMapNodes(fetchedNodes);
      setMapConnections(mapRes.data.connections);
      const mapNode = fetchedNodes.find(
        (mn) => mn.id === n.id || mn.name === n.id,
      );
      setMapNode(mapNode);
      const devRes = await axios.get(`/api/devices?node=${n.id}`);
      const filtered = Array.isArray(devRes.data)
        ? devRes.data.filter((d) => d.node_id === n.id)
        : [];
      setNodeDevices(filtered);
      setShowMapModal(true);
    } catch (err) {
      console.error("Failed to open map:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/nodes");
        setNodes(res.data);
        const deviceEntries = await Promise.all(
          res.data.map(async (n) => {
            try {
              const dres = await axios.get(`/api/devices?node=${n.id}`);
              const filtered = Array.isArray(dres.data)
                ? dres.data.filter((d) => d.node_id === n.id)
                : [];
              return [n.id, filtered];
            } catch (err) {
              console.error("Failed to fetch node devices:", err);
              return [n.id, []];
            }
          }),
        );
        setDevicesByNode(Object.fromEntries(deviceEntries));
      } catch (err) {
        console.error("Failed to fetch nodes:", err);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  return (
    <div className="node-list-container">
      <h1 className="node-list-title">Node List</h1>
      <div className="node-list">
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`node-card ${
              highlighted === node.id ? "highlight" : ""
            } ${node.status ? node.status.toLowerCase() : ""}`}
            ref={(el) => (nodeRefs.current[node.id] = el)}
          >
            <div className="node-header">
              <h2>{node.name}</h2>
              <p>
                Status:{" "}
                <span className={`status-badge ${node.status.toLowerCase()}`}>
                  {node.status}
                </span>
              </p>
            </div>
            <div className="node-details">
              <div className="node-summary">
                <p>
                  <strong>Node ID:</strong> {node.id}
                </p>
                <p>
                  <strong>Type:</strong> {node.type}
                </p>
                <p>
                  <strong>KME:</strong> {node.kme}
                </p>
                <p>
                  <strong>Coordinates:</strong> Lat{" "}
                  {roundToThreeMinutes(node.coordinates.lat)}, Long{" "}
                  {roundToThreeMinutes(node.coordinates.long)}
                  <button
                    className="node-action-btn inline-map-btn"
                    onClick={() => handleViewOnMap(node)}
                  >
                    Show on Map
                  </button>
                </p>
              </div>

              <hr className="node-separator" />

              <div className="node-sections">
                <div className="node-section">
                  <h4 className="node-section-title">
                    Connections ({node.connections.length})
                  </h4>
                  <ul>
                    {node.connections.map((conn, index) => (
                      <li key={index}>
                        Connected via{" "}
                        <a
                          href={`/devices?device=${encodeURIComponent(
                            conn.device,
                          )}`}
                          className="device-link"
                        >
                          {conn.device}
                        </a>{" "}
                        to node{" "}
                        <a
                          href="#"
                          onClick={() => handleNodeClick(conn.otherNode)}
                          className="node-link"
                        >
                          {conn.otherNode}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="node-section">
                  <h4 className="node-section-title">
                    Applications ({node.apps.length})
                  </h4>
                  <div className="applications-container">
                    {node.apps.map((app, index) => (
                      <a
                        key={index}
                        href={`/apps?app=${encodeURIComponent(app)}`}
                        className="app-label app-link"
                      >
                        {app}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="node-section">
                  <h4 className="node-section-title">
                    Devices (
                    {devicesByNode[node.id] ? devicesByNode[node.id].length : 0}
                    )
                  </h4>
                  <ul className="devices-list">
                    {devicesByNode[node.id] ? (
                      devicesByNode[node.id].map((dev) => (
                        <li key={dev.id || dev.device}>
                          <a
                            href={`/devices?device=${encodeURIComponent(
                              dev.id || dev.device,
                            )}`}
                            className="device-link"
                          >
                            {dev.id || dev.device}
                          </a>
                        </li>
                      ))
                    ) : (
                      <li>Loading...</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showMapModal && mapNode && (
        <NodeDevicesMap
          devices={nodeDevices}
          node={mapNode}
          nodes={mapNodes}
          connections={mapConnections}
          onClose={() => setShowMapModal(false)}
          highlightNode={highlightMapNode}
        />
      )}
    </div>
  );
};

export default NodeList;
