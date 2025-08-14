import React, { useEffect, useRef } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import { Tile as TileLayer } from "ol/layer";
import { XYZ } from "ol/source";
import { fromLonLat } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Fill, Stroke, Text, Circle as CircleStyle } from "ol/style";

const NodeDevicesMap = ({
  devices,
  node,
  nodes = [],
  connections = [],
  onClose,
  highlightDevice,
  highlightNode,
}) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const format = new GeoJSON();

    const nodeGeoJSON = {
      type: "FeatureCollection",
      features: nodes.map((n) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: Array.isArray(n.coordinates)
            ? n.coordinates
            : [n.coordinates.long, n.coordinates.lat],
        },
        properties: { id: n.id, name: n.name, endpoint: Boolean(n.endpoint) },
      })),
    };

    const nodeFeatures = format.readFeatures(nodeGeoJSON, {
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    });

    nodeFeatures.forEach((feature) => {
      const { id, name, endpoint } = feature.getProperties();
      const isHighlighted = highlightNode && id === highlightNode;
      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: isHighlighted ? 12 : 10,
            fill: new Fill({
              color: isHighlighted ? "yellow" : endpoint ? "blue" : "gray",
            }),
            stroke: new Stroke({ color: "white", width: 1 }),
          }),
          text: new Text({
            text: name,
            offsetY: -16,
            font: "bold 12px Arial",
            fill: new Fill({ color: "white" }),
          }),
        }),
      );
    });

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
            return null;
          }

          if (fromNode.id !== node.id && toNode.id !== node.id) {
            return null;
          }

          const statusColor =
            connection.status === "up"
              ? "green"
              : connection.status === "down"
                ? "red"
                : connection.status;

          return {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [fromNode.coordinates, toNode.coordinates],
            },
            properties: { status: statusColor },
          };
        })
        .filter(Boolean),
    };

    const connectionFeatures = format.readFeatures(connectionGeoJSON, {
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    });

    connectionFeatures.forEach((feature) => {
      const { status } = feature.getProperties();
      feature.setStyle(
        new Style({
          stroke: new Stroke({ color: status, width: 3 }),
        }),
      );
    });

    const deviceGeoJSON = {
      type: "FeatureCollection",
      features: devices.map((dev) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: Array.isArray(dev.coordinates)
            ? dev.coordinates
            : [dev.coordinates.long, dev.coordinates.lat],
        },
        properties: { id: dev.id },
      })),
    };

    const deviceFeatures = format.readFeatures(deviceGeoJSON, {
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    });

    deviceFeatures.forEach((feature) => {
      const id = feature.get("id");
      const isHighlighted = highlightDevice && id === highlightDevice;
      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: isHighlighted ? 8 : 6,
            fill: new Fill({ color: isHighlighted ? "yellow" : "red" }),
            stroke: new Stroke({ color: "white", width: 1 }),
          }),
        }),
      );
    });

    const nodeLayer = new VectorLayer({
      source: new VectorSource({ features: nodeFeatures }),
    });
    const connectionLayer = new VectorLayer({
      source: new VectorSource({ features: connectionFeatures }),
    });
    const deviceLayer = new VectorLayer({
      source: new VectorSource({ features: deviceFeatures }),
    });

    const centerCoords = (() => {
      if (highlightDevice) {
        const dev = devices.find((d) => d.id === highlightDevice);
        if (dev) {
          return Array.isArray(dev.coordinates)
            ? dev.coordinates
            : [dev.coordinates.long, dev.coordinates.lat];
        }
      }
      return node.coordinates;
    })();

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
            attributions: "© OpenStreetMap contributors © CARTO",
          }),
        }),
        connectionLayer,
        nodeLayer,
        deviceLayer,
      ],
      view: new View({
        center: fromLonLat(centerCoords),
        zoom: 12,
      }),
    });

    if (devices.length > 0) {
      const lonLats = devices.map((dev) =>
        Array.isArray(dev.coordinates)
          ? dev.coordinates
          : [dev.coordinates.long, dev.coordinates.lat],
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

    return () => {
      map.setTarget(null);
    };
  }, [devices, node, nodes, connections, highlightDevice, highlightNode]);

  return (
    <div className="modal modal-large">
      <div className="modal-content modal-content-large">
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
};

export default NodeDevicesMap;
