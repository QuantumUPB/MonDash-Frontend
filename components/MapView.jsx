import React, { useEffect, useRef, useState, useContext } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import "ol/ol.css"; // Import default OpenLayers styles
import { Map, View } from "ol";
import { Tile as TileLayer } from "ol/layer";
import { XYZ } from "ol/source";
import { fromLonLat } from "ol/proj";
import {
  Style,
  Fill,
  Stroke,
  Text,
  Circle as CircleStyle,
  Icon,
} from "ol/style";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Overlay from "ol/Overlay";
import { AutoRefreshContext } from "./AutoRefreshContext";
import NodeDevicesMap from "./NodeDevicesMap";

// Utility function to slightly lighten a CSS color
const lightenColor = (color, percent) => {
  const dummy = document.createElement("div");
  dummy.style.color = color;
  document.body.appendChild(dummy);
  const computed = getComputedStyle(dummy).color;
  document.body.removeChild(dummy);
  const rgb = computed
    .replace(/rgba?\(([^)]+)\)/, "$1")
    .split(",")
    .map((v) => parseInt(v.trim(), 10));
  const [r, g, b] = rgb;
  const lighten = (c) => Math.min(255, Math.round(c + (255 - c) * percent));
  return `rgb(${lighten(r)}, ${lighten(g)}, ${lighten(b)})`;
};

const getStatusColor = (status) => {
  if (!status) return undefined;
  const s = String(status).toLowerCase();
  if (s === "up" || s === "green") return "green";
  if (s === "down" || s === "red") return "red";
  return undefined;
};

const nodeStyle = (name, endpoint, highlight = false, color, dim = false) =>
  new Style({
    image: new CircleStyle({
      radius: 10,
      fill: new Fill({
        color: highlight
          ? lightenColor(color || (endpoint ? "green" : "gray"), 0.3)
          : dim
            ? "#555"
            : color || (endpoint ? "green" : "gray"),
      }),
      stroke: new Stroke({ color: "white", width: 1 }),
    }),
    text: new Text({
      text: name,
      offsetY: -16,
      font: "bold 12px Arial",
      fill: new Fill({ color: "white" }),
    }),
  });

const connectionStyle = (color, highlight = false, dim = false) =>
  new Style({
    stroke: new Stroke({
      color: highlight ? lightenColor(color, 0.3) : dim ? "#555" : color,
      width: 3,
    }),
  });

const MapView = () => {
  const mapRef = useRef(null);
  const { refreshTrigger } = useContext(AutoRefreshContext);

  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeDevices, setNodeDevices] = useState([]);
  const [hasMapData, setHasMapData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const debugModeRef = useRef(debugMode);
  const debugLog = (...args) => {
    if (debugModeRef.current) console.log(...args);
  };
  const [keyPairCount, setKeyPairCount] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const tooltipRef = useRef(
    typeof document !== "undefined" ? document.createElement("div") : null,
  );
  const nodePopupRef = useRef(
    typeof document !== "undefined" ? document.createElement("div") : null,
  );
  const connectionPopupRef = useRef(
    typeof document !== "undefined" ? document.createElement("div") : null,
  );
  const [selectedConnection, setSelectedConnection] = useState(null);
  const hoveredNodeRef = useRef(null);
  const hoveredConnectionRef = useRef(null);
  const animationRef = useRef();
  const [apps, setApps] = useState([]);
  const [appDetails, setAppDetails] = useState({});
  const [selectedApp, setSelectedApp] = useState("global");

  useEffect(() => {
    if (
      !tooltipRef.current ||
      !nodePopupRef.current ||
      !connectionPopupRef.current
    )
      return;
    tooltipRef.current.className = "map-tooltip";
    nodePopupRef.current.className = "node-popup";
    connectionPopupRef.current.className = "connection-popup";
  }, []);

  useEffect(() => {
    debugModeRef.current = debugMode;
  }, [debugMode]);

  useEffect(() => {
    axios
      .get("/api/map")
      .then((res) => {
        const fetchedNodes = res.data.nodes.map((node) => ({
          ...node,
          coordinates: Array.isArray(node.coordinates)
            ? node.coordinates
            : [node.coordinates.long, node.coordinates.lat],
          endpoint: Boolean(node.endpoint),
        }));
        setNodes(fetchedNodes);
        setConnections(res.data.connections);
        setHasMapData(fetchedNodes.length > 0);
      })
      .catch((err) => {
        console.error("Failed to fetch map data:", err);
        setHasMapData(false);
      });
  }, [refreshTrigger]);

  useEffect(() => {
    axios
      .get("/api/apps")
      .then((res) => {
        const names = [];
        const details = {};
        if (Array.isArray(res.data)) {
          res.data.forEach((app) => {
            if (typeof app === "string") {
              names.push(app);
            } else if (app && app.name) {
              names.push(app.name);
              details[app.name] = {
                nodes: Array.isArray(app.nodes) ? app.nodes : [],
                color: app.color || "#ff8c00",
              };
            }
          });
        }
        setApps(names);
        setAppDetails(details);
      })
      .catch((err) => console.error("Failed to fetch apps:", err));
  }, [refreshTrigger]);

  useEffect(() => {
    const format = new GeoJSON();

    const appInfo = appDetails[selectedApp] || {};
    const accessibleNodesRaw =
      selectedApp === "global" ? [] : appInfo.nodes || [];

    const isNodeAccessible = (nodeName) => {
      if (accessibleNodesRaw.includes(nodeName)) return true;
      const nodeId = nodes.find((n) => n.name === nodeName)?.id;
      return nodeId && accessibleNodesRaw.includes(nodeId);
    };
    const appColor = appInfo.color || "#ff8c00";

    // Convert nodes to GeoJSON features
    const nodeGeoJSON = {
      type: "FeatureCollection",
      features: nodes.map((node) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: node.coordinates },
        properties: {
          name: node.name,
          endpoint: node.endpoint,
          status: node.status,
        },
      })),
    };

    const nodeFeatures = format.readFeatures(nodeGeoJSON, {
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    });

    nodeFeatures.forEach((feature) => {
      const { name, endpoint, status } = feature.getProperties();
      let color;
      let dim = false;
      if (selectedApp === "global") {
        color = getStatusColor(status);
      } else {
        const accessible = isNodeAccessible(name);
        color = accessible ? "green" : undefined;
        dim = !accessible;
      }
      feature.setStyle(nodeStyle(name, endpoint, false, color, dim));
    });

    // Convert connections to GeoJSON features
    const connectionGeoJSON = {
      type: "FeatureCollection",
      features: connections
        .map((connection) => {
          const fromNode = nodes.find(
            (n) => n.id === connection.from || n.name === connection.from,
          );
          const toNode = nodes.find(
            (n) => n.id === connection.to || n.name === connection.to,
          );

          if (!fromNode || !toNode) {
            console.warn(
              `Invalid connection: ${connection.from} -> ${connection.to}`,
            );
            return null;
          }

          const statusColor =
            getStatusColor(connection.status) || connection.status;

          const appsForConnection = Object.entries(appDetails)
            .filter(([, info]) => {
              const list = info.nodes || [];
              const fromOk =
                list.includes(fromNode.name) || list.includes(fromNode.id);
              const toOk =
                list.includes(toNode.name) || list.includes(toNode.id);
              return fromOk && toOk;
            })
            .map(([name]) => name);

          const allApps = Array.from(
            new Set([...(connection.apps || []), ...appsForConnection]),
          );

          return {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [fromNode.coordinates, toNode.coordinates],
            },
            properties: {
              status: statusColor,
              apps: allApps,
              fromName: fromNode.name,
              toName: toNode.name,
            },
          };
        })
        .filter(Boolean),
    };

    const connectionFeatures = format.readFeatures(connectionGeoJSON, {
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    });

    connectionFeatures.forEach((feature) => {
      const {
        status,
        apps: featureApps,
        fromName,
        toName,
      } = feature.getProperties();
      let color;
      let dim = false;
      if (selectedApp === "global") {
        color = getStatusColor(status) || status;
      } else {
        const belongsToApp =
          (featureApps || []).includes(selectedApp) &&
          isNodeAccessible(fromName) &&
          isNodeAccessible(toName);
        color = belongsToApp ? "green" : undefined;
        dim = !belongsToApp;
      }
      feature.setStyle(
        connectionStyle(color || getStatusColor(status) || status, false, dim),
      );
    });

    const nodeSource = new VectorSource({ features: nodeFeatures });
    const connectionSource = new VectorSource({ features: connectionFeatures });

    const nodeLayer = new VectorLayer({ source: nodeSource });
    const connectionLayer = new VectorLayer({ source: connectionSource });

    const PIXEL_LENGTH_THRESHOLD = 200;
    const SPAWN_INTERVAL = 3000; // ms
    const keyStyle = new Style({
      image: new Icon({
        src: "/key.png",
        scale: 0.05, // larger icon to ensure visibility
        crossOrigin: "anonymous",
      }),
    });

    const connectionInfos = connections
      .flatMap((connection) => {
        const fromNode = nodes.find(
          (n) => n.id === connection.from || n.name === connection.from,
        );
        const toNode = nodes.find(
          (n) => n.id === connection.to || n.name === connection.to,
        );
        if (!fromNode || !toNode) {
          return [];
        }
        const allowed =
          selectedApp === "global" ||
          ((connection.apps || []).includes(selectedApp) &&
            isNodeAccessible(fromNode.name) &&
            isNodeAccessible(toNode.name));
        if (!allowed) {
          return [];
        }
        const fromCoord = fromLonLat(
          Array.isArray(fromNode.coordinates)
            ? fromNode.coordinates
            : [fromNode.coordinates.long, fromNode.coordinates.lat],
        );
        const toCoord = fromLonLat(
          Array.isArray(toNode.coordinates)
            ? toNode.coordinates
            : [toNode.coordinates.long, toNode.coordinates.lat],
        );
        const dx = toCoord[0] - fromCoord[0];
        const dy = toCoord[1] - fromCoord[1];
        const length = Math.hypot(dx, dy);
        const center = [fromCoord[0] + dx / 2, fromCoord[1] + dy / 2];
        return [
          {
            from: fromCoord,
            to: toCoord,
            dx,
            dy,
            length,
            center,
            lastSpawn: 0,
          },
        ];
      })
      .flat();

    const activePairs = [];
    setKeyPairCount(activePairs.length);
    debugLog("Created keyLayer for animations");

    const keySource = new VectorSource();
    const keyLayer = new VectorLayer({ source: keySource });
    const baseLayer = new TileLayer({
      source: new XYZ({
        url: "https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        attributions: "© OpenStreetMap contributors © CARTO",
      }),
    });

    // Initialize the map
    const map = new Map({
      target: mapRef.current,
      layers: [
        baseLayer,
        connectionLayer,
        ...(animationsEnabled ? [keyLayer] : []),
        nodeLayer,
      ],
      view: new View({
        center: fromLonLat([25.0, 45.9432]), // Approximate center of Romania
        zoom: 8,
      }),
    });

    // Fit the map view to show all nodes
    if (nodes.length > 0) {
      const lonLats = nodes.map((n) =>
        Array.isArray(n.coordinates)
          ? n.coordinates
          : [n.coordinates.long, n.coordinates.lat],
      );
      let minX = lonLats[0][0];
      let minY = lonLats[0][1];
      let maxX = lonLats[0][0];
      let maxY = lonLats[0][1];
      lonLats.forEach(([x, y]) => {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      });
      const bottomLeft = fromLonLat([minX, minY]);
      const topRight = fromLonLat([maxX, maxY]);
      const extent = [...bottomLeft, ...topRight];
      if (!extent.some((v) => isNaN(v))) {
        const view = typeof map.getView === "function" ? map.getView() : null;
        if (view && typeof view.fit === "function") {
          view.fit(extent, { padding: [50, 50, 50, 50], maxZoom: 18 });
        }
      }
    }

    debugLog("Map initialized. Animations enabled:", animationsEnabled);

    const overlay = new Overlay({
      element: tooltipRef.current,
      offset: [10, 0],
      positioning: "center-left",
    });

    const nodePopup = new Overlay({
      element: nodePopupRef.current,
      offset: [0, -15],
      positioning: "bottom-center",
    });

    const connectionPopup = new Overlay({
      element: connectionPopupRef.current,
      offset: [0, -15],
      positioning: "bottom-center",
    });

    map.addOverlay(overlay);
    map.addOverlay(nodePopup);
    map.addOverlay(connectionPopup);

    const pixelSpeed = 2; // pixels per frame
    const spawnKeys = () => {
      const now = Date.now();
      connectionInfos.forEach((info) => {
        if (now - info.lastSpawn >= SPAWN_INTERVAL) {
          info.lastSpawn = now;
          const feat1 = new Feature(new Point(info.center));
          feat1.setStyle(keyStyle);
          feat1.set("isKey", true);
          const feat2 = new Feature(new Point(info.center));
          feat2.setStyle(keyStyle);
          feat2.set("isKey", true);
          keySource.addFeature(feat1);
          keySource.addFeature(feat2);
          activePairs.push({ feat1, feat2, info, progress: 0 });
        }
      });
    };

    const animateKeys = () => {
      setFrameCount((c) => c + 1);
      const view = typeof map.getView === "function" ? map.getView() : null;
      const resolution =
        view && typeof view.getResolution === "function"
          ? view.getResolution()
          : 1;

      spawnKeys();

      const remaining = [];
      activePairs.forEach((obj) => {
        const pixelLength = obj.info.length / resolution;
        if (pixelLength < PIXEL_LENGTH_THRESHOLD) {
          obj.feat1.setStyle(null);
          obj.feat2.setStyle(null);
        } else {
          obj.feat1.setStyle(keyStyle);
          obj.feat2.setStyle(keyStyle);
        }

        const increment = (pixelSpeed * resolution) / obj.info.length;
        obj.progress += increment;
        if (obj.progress >= 1) {
          keySource.removeFeature(obj.feat1);
          keySource.removeFeature(obj.feat2);
          return;
        }
        const x1 = obj.info.center[0] - (obj.info.dx * obj.progress) / 2;
        const y1 = obj.info.center[1] - (obj.info.dy * obj.progress) / 2;
        const x2 = obj.info.center[0] + (obj.info.dx * obj.progress) / 2;
        const y2 = obj.info.center[1] + (obj.info.dy * obj.progress) / 2;
        obj.feat1.getGeometry().setCoordinates([x1, y1]);
        obj.feat2.getGeometry().setCoordinates([x2, y2]);
        remaining.push(obj);
      });

      activePairs.length = 0;
      remaining.forEach((p) => activePairs.push(p));
      setKeyPairCount(activePairs.length);

      map.render();
      animationRef.current = requestAnimationFrame(animateKeys);
    };

    if (animationsEnabled) {
      debugLog("Animations enabled, starting loop");
      animationRef.current = requestAnimationFrame(animateKeys);
    } else {
      debugLog("Animations disabled, not starting loop");
    }

    const resetHoverStyles = () => {
      if (hoveredNodeRef.current) {
        const { name, endpoint, status } =
          hoveredNodeRef.current.getProperties();
        let color;
        let dim = false;
        if (selectedApp === "global") {
          color = getStatusColor(status);
        } else {
          const accessible = isNodeAccessible(name);
          color = accessible ? "green" : undefined;
          dim = !accessible;
        }
        hoveredNodeRef.current.setStyle(
          nodeStyle(name, endpoint, false, color, dim),
        );
        hoveredNodeRef.current = null;
      }
      if (hoveredConnectionRef.current) {
        const {
          status,
          apps: featureApps,
          fromName,
          toName,
        } = hoveredConnectionRef.current.getProperties();
        let color;
        let dim = false;
        if (selectedApp === "global") {
          color = getStatusColor(status) || status;
        } else {
          const belongsToApp =
            (featureApps || []).includes(selectedApp) &&
            isNodeAccessible(fromName) &&
            isNodeAccessible(toName);
          color = belongsToApp ? "green" : undefined;
          dim = !belongsToApp;
        }
        hoveredConnectionRef.current.setStyle(
          connectionStyle(
            color || getStatusColor(status) || status,
            false,
            dim,
          ),
        );
        hoveredConnectionRef.current = null;
      }
    };

    const handlePointerMove = (evt) => {
      if (evt.dragging) return;

      resetHoverStyles();

      let found = false;
      map.forEachFeatureAtPixel(
        evt.pixel,
        (feature) => {
          if (feature.get("isKey")) return false;
          const geomType = feature.getGeometry().getType();
          if (geomType === "LineString") {
            const apps = feature.get("apps");
            overlay.setPosition(evt.coordinate);
            if (apps && apps.length > 0) {
              tooltipRef.current.innerHTML = `Apps: ${apps.join(", ")}`;
            } else {
              tooltipRef.current.innerHTML = "No apps assigned";
            }
            tooltipRef.current.style.display = "block";
            map.getTargetElement().style.cursor = "pointer";
            const { status, fromName, toName } = feature.getProperties();
            let color;
            if (selectedApp === "global") {
              color = getStatusColor(status) || status;
              feature.setStyle(connectionStyle(color, true));
            } else {
              const belongsToApp =
                (apps || []).includes(selectedApp) &&
                isNodeAccessible(fromName) &&
                isNodeAccessible(toName);
              color = belongsToApp ? "green" : undefined;
              feature.setStyle(
                connectionStyle(
                  color || getStatusColor(status) || status,
                  true,
                  !belongsToApp,
                ),
              );
            }
            hoveredConnectionRef.current = feature;
            found = true;
            return true;
          } else if (geomType === "Point") {
            const name = feature.get("name");
            overlay.setPosition(evt.coordinate);
            tooltipRef.current.innerHTML = `Node: ${name} (click for details)`;
            tooltipRef.current.style.display = "block";
            map.getTargetElement().style.cursor = "pointer";
            const { endpoint, status } = feature.getProperties();
            let color;
            if (selectedApp === "global") {
              color = getStatusColor(status);
              feature.setStyle(nodeStyle(name, endpoint, true, color));
            } else {
              const accessible = isNodeAccessible(name);
              color = accessible ? "green" : undefined;
              feature.setStyle(
                nodeStyle(name, endpoint, true, color, !accessible),
              );
            }
            hoveredNodeRef.current = feature;
            found = true;
            return true;
          }
          return false;
        },
        { hitTolerance: 1, layerFilter: (layer) => layer !== keyLayer },
      );

      if (!found) {
        tooltipRef.current.style.display = "none";
        map.getTargetElement().style.cursor = "";
      }
    };

    map.on("pointermove", handlePointerMove);

    const handleMapClick = (evt) => {
      let found = false;
      map.forEachFeatureAtPixel(
        evt.pixel,
        (feature) => {
          if (feature.get("isKey")) return false;
          const geomType = feature.getGeometry().getType();
          if (geomType === "Point") {
            const name = feature.get("name");
            const node = nodes.find((n) => n.name === name);
            if (node) {
              found = true;
              setSelectedConnection(null);
              connectionPopup.setPosition(undefined);
              setSelectedNode(node);
              nodePopup.setPosition(feature.getGeometry().getCoordinates());
              axios
                .get(`/api/devices?node=${node.id}`)
                .then((res) => {
                  const filtered = Array.isArray(res.data)
                    ? res.data.filter((d) => d.node_id === node.id)
                    : [];
                  setNodeDevices(filtered);
                })
                .catch((err) => console.error("Failed to fetch devices:", err));
            }
          } else if (geomType === "LineString") {
            const apps = feature.get("apps");
            found = true;
            setSelectedNode(null);
            setNodeDevices([]);
            nodePopup.setPosition(undefined);
            setSelectedConnection({
              apps: apps && apps.length > 0 ? apps : [],
            });
            connectionPopup.setPosition(evt.coordinate);
          }
        },
        { hitTolerance: 1, layerFilter: (layer) => layer !== keyLayer },
      );
      if (!found) {
        setSelectedNode(null);
        setNodeDevices([]);
        nodePopup.setPosition(undefined);
        setSelectedConnection(null);
        connectionPopup.setPosition(undefined);
      }
    };

    map.on("singleclick", handleMapClick);

    return () => {
      debugLog("Cleaning up map and animations");
      map.un("pointermove", handlePointerMove);
      map.un("singleclick", handleMapClick);
      map.removeOverlay(overlay);
      map.removeOverlay(nodePopup);
      map.removeOverlay(connectionPopup);
      map.removeLayer(keyLayer);
      cancelAnimationFrame(animationRef.current);
      map.setTarget(null); // Cleanup on unmount
    };
  }, [nodes, connections, animationsEnabled, selectedApp, appDetails]);

  if (!hasMapData) {
    return (
      <p className="no-map-permission">
        You do not have permissions to view map data.
      </p>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <div
        className="mapview"
        ref={mapRef}
        style={{
          width: "100%",
          height: "calc(100vh - 40px)",
          backgroundColor: "black",
        }}
      />
      <button
        onClick={() => {
          debugLog("Toggling animations to", !animationsEnabled);
          setAnimationsEnabled(!animationsEnabled);
        }}
        style={{ position: "absolute", bottom: 90, right: 10, zIndex: 1000 }}
      >
        {animationsEnabled ? "Disable Animations" : "Enable Animations"}
      </button>
      <button
        onClick={() => setDebugMode((d) => !d)}
        style={{ position: "absolute", bottom: 50, right: 10, zIndex: 1000 }}
      >
        {debugMode ? "Hide Debug" : "Show Debug"}
      </button>
      {debugMode && (
        <div
          style={{
            position: "absolute",
            bottom: 50,
            left: 10,
            background: "rgba(0,0,0,0.6)",
            color: "#0f0",
            padding: "4px 8px",
            fontSize: "12px",
            borderRadius: "4px",
            zIndex: 1000,
          }}
        >
          <div>Pairs: {keyPairCount}</div>
          <div>Frames: {frameCount}</div>
        </div>
      )}
      {createPortal(
        selectedNode ? (
          <div>
            <div>
              <strong>Node name:</strong> {selectedNode.name}
            </div>
            <div>
              <strong>Devices:</strong>
            </div>
            <ul>
              {nodeDevices.map((dev) => (
                <li key={dev.id}>{dev.id}</li>
              ))}
            </ul>
            <button onClick={() => setShowModal(true)}>
              Node layout (on map)
            </button>
          </div>
        ) : null,
        nodePopupRef.current,
      )}
      {createPortal(
        selectedConnection ? (
          <div>
            <strong>Apps</strong>
            {selectedConnection.apps && selectedConnection.apps.length > 0 ? (
              <ul>
                {selectedConnection.apps.map((app) => (
                  <li key={app}>{app}</li>
                ))}
              </ul>
            ) : (
              <p>No apps assigned</p>
            )}
          </div>
        ) : null,
        connectionPopupRef.current,
      )}
      {showModal && (
        <NodeDevicesMap
          devices={nodeDevices}
          node={selectedNode}
          nodes={nodes}
          connections={connections}
          onClose={() => setShowModal(false)}
        />
      )}
      <div className="app-bar">
        <button
          className={selectedApp === "global" ? "active" : ""}
          onClick={() => setSelectedApp("global")}
        >
          <span className="app-icon" role="img" aria-label="global">
            🌐
          </span>
          <span className="app-name">Global</span>
        </button>
        {apps.map((app) => (
          <button
            key={app}
            className={selectedApp === app ? "active" : ""}
            onClick={() => setSelectedApp(app)}
          >
            <span className="app-icon" role="img" aria-label="app">
              📦
            </span>
            <span className="app-name">{app}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MapView;
