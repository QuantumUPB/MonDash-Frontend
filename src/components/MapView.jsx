import React, { useEffect, useRef } from 'react';
import 'ol/ol.css'; // Import default OpenLayers styles
import { Map, View } from 'ol';
import { Tile as TileLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { Style, Fill, Stroke, Text, Circle as CircleStyle } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';

const MapView = () => {
  const mapRef = useRef(null);

  // Hardcoded data for nodes and connections
  const nodes = [
    { id: 'Bucharest', name: 'Bucharest', coordinates: [26.1025, 44.4268], endpoint: true },
    { id: 'Iasi', name: 'Iasi', coordinates: [27.6014, 47.1585], endpoint: true },
    { id: 'Craiova', name: 'Craiova', coordinates: [23.7949, 44.3302], endpoint: true },
    { id: 'Arad', name: 'Arad', coordinates: [21.3123, 46.1866], endpoint: false },
    { id: 'Timisoara', name: 'Timisoara', coordinates: [21.2087, 45.7489], endpoint: true },
    { id: 'Clujnapoca', name: 'Cluj-Napoca', coordinates: [23.5899, 46.7712], endpoint: true },
  ];

  const connections = [
    { from: 'Bucharest', to: 'Iasi', status: 'green' },
    { from: 'Bucharest', to: 'Craiova', status: 'green' },
    { from: 'Craiova', to: 'Arad', status: 'green' },
    { from: 'Arad', to: 'Timisoara', status: 'red' },
    { from: 'Arad', to: 'Clujnapoca', status: 'green' },
  ];

  useEffect(() => {
    // Create node features
    const nodeFeatures = nodes.map((node) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat(node.coordinates)),
        name: node.name,
      });

      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 10,
            fill: new Fill({ color: node.endpoint ? 'blue' : 'gray' }),
            stroke: new Stroke({ color: 'white', width: 1 }),
          }),
          text: new Text({
            text: node.name,
            offsetY: -12,
            font: '12px Arial',
            fill: new Fill({ color: 'white' }),
          }),
        })
      );

      return feature;
    });

    // Create connection features
    const connectionFeatures = connections.map((connection) => {
      const fromNode = nodes.find((node) => node.id === connection.from);
      const toNode = nodes.find((node) => node.id === connection.to);

      const feature = new Feature({
        geometry: new LineString([
          fromLonLat(fromNode.coordinates),
          fromLonLat(toNode.coordinates),
        ]),
      });

      feature.setStyle(
        new Style({
          stroke: new Stroke({
            color: connection.status,
            width: 3,
          }),
        })
      );

      return feature;
    });

    // Create vector sources and layers
    const nodeSource = new VectorSource({ features: nodeFeatures });
    const connectionSource = new VectorSource({ features: connectionFeatures });

    const nodeLayer = new VectorLayer({ source: nodeSource });
    const connectionLayer = new VectorLayer({ source: connectionSource });

    // Initialize the map
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        connectionLayer,
        nodeLayer,
      ],
      view: new View({
        center: fromLonLat([25.0, 45.9432]), // Approximate center of Romania
        zoom: 8,
      }),
    });

    return () => map.setTarget(null); // Cleanup on unmount
  }, []);

  return <div className="mapview" ref={mapRef} style={{ width: '100%', height: '100vh', backgroundColor: 'black' }} />;
};

export default MapView;
