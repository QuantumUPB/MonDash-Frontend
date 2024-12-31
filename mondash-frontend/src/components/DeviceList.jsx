import React, { useState } from 'react';
import { useRef } from 'react';
import './DeviceList.css';

const DeviceList = () => {
  const devices = [
    {
      id: 'QKD1-A',
      device: 'IQC Cerberis XG QKD',
      status: 'Running',
      node_id: 'Bucharest',
      connected_to: {
        "id": "QKD1-B",
        "node_id": "Craiova"
      },
      self_reporting: {
        "key_rate": 100,
        "max_key_rate": 200,
        "gen_rate": 200,
        "usage_rate": 50,
        "logs": [
          "Device started",
          "Key rate increased",
          "Key rate decreased",
          "Device stopped"
        ]
      }
    },
    {
      id: 'QKD1-B',
      device: 'IQC Cerberis XG QKD',
      status: 'Running',
      node_id: 'Craiova',
      connected_to: {
        "id": "QKD1-A",
        "node_id": "Bucharest"
      },
      self_reporting: {
        "key_rate": 150,
        "max_key_rate": 500,
        "gen_rate": 250,
        "usage_rate": 70,
        "logs": [
          "Device started",
          "Key rate increased",
          "Key rate decreased",
          "Device stopped"
        ]
      }
    },
    {
      id: 'QKD2-A',
      device: 'IQC Cerberis XG QKD',
      status: 'Running',
      node_id: 'Arad',
      connected_to: {
        "id": "QKD2-B",
        "node_id": "Timisoara"
      },
      self_reporting: {
        "key_rate": 200,
        "max_key_rate": 200,
        "gen_rate": 300,
        "usage_rate": 90,
        "logs": [
          "Device started",
          "Key rate increased",
          "Key rate decreased",
          "Device stopped"
        ]
      }
    },
    {
      id: 'QKD2-B',
      device: 'IQC Cerberis XG QKD',
      status: 'Running',
      node_id: 'Timisoara',
      connected_to: {
        "id": "QKD2-A",
        "node_id": "Arad"
      },
      self_reporting: {
        "key_rate": 250,
        "max_key_rate": 300,
        "gen_rate": 350,
        "usage_rate": 100,
        "logs": [
          "Device started",
          "Key rate increased",
          "Key rate decreased",
          "Device stopped"
        ]
      }
    }
  ];

  const [selectedDevice, setSelectedDevice] = useState({});
  const [highlightDevice, setHighlightDevice] = useState(null);
  const deviceRefs = useRef({}); // Refs for each device element

  const handleViewOnMap = () => {
    alert(`Highlighting connection for ${selectedDevice.id} on the map.`);
    // Implement map highlighting logic here
  };

  const handleConnectedClick = (deviceId) => {
    // Scroll to the connected device and highlight it
    const targetDevice = deviceRefs.current[deviceId];
    if (targetDevice) {
      targetDevice.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Highlight the device
      setHighlightDevice(deviceId);
      setTimeout(() => setHighlightDevice(null), 2000); // Remove highlight after 2 seconds
    }
  };

  return (
    <div className="device-list-container">
      <h1 className="device-list-title">Device List</h1>
      <div className="device-list">
        {devices.map((device) => (
          <div
            key={device.id}
            ref={(el) => (deviceRefs.current[device.id] = el)}
            className={`device-card ${highlightDevice === device.id ? 'highlight' : ''}`}
          >
            <div className="device-card-header">
              <h2>{device.id}</h2>
              <p>
                Status: <span className={`status-badge ${device.status.toLowerCase()}`}>{device.status}</span>
              </p>
            </div>
            <div className="device-card-body">
              <div className="device-details">
                <p>Device: {device.device}</p>
                <p>Node: <a href="#" className="device-node-link">{device.node_id}</a></p>
                <p>
                  Connected to: 
                  <a
                    href="#"
                    className="device-connected-link"
                    onClick={() => handleConnectedClick(device.connected_to.id)}
                  >
                    {device.connected_to.id}
                  </a>
                </p>
              </div>
              <div className="device-key-rate">
                <p>Key Rate:</p>
                <div className="key-rate-bar">
                  <div
                    className="key-rate-progress"
                    style={{ width: `${(device.self_reporting.key_rate / device.self_reporting.max_key_rate) * 100}%` }}
                  ></div>
                </div>
                <p>{device.self_reporting.key_rate} bps / {device.self_reporting.max_key_rate} bps</p>
              </div>
            </div>
            <div className="device-card-footer">
              {selectedDevice.id !== device.id ? (
                <button
                  className="device-action-btn view-details-btn"
                  onClick={() => setSelectedDevice(device)}
                >
                  View Details
                </button>
              ) : (
                <button
                  className="device-action-btn hide-details-btn"
                  onClick={() => setSelectedDevice({})}
                >
                  Hide Details
                </button>
              )}
              <button className="device-action-btn map-btn" onClick={handleViewOnMap}>View on Map</button>
              <button className="device-action-btn alert-btn">Set Alert</button>
            </div>
            {selectedDevice.id === device.id && (
              <div className="device-details-extended">
                <h3>Self Reporting</h3>
                <p>Generation Rate: {device.self_reporting.gen_rate}</p>
                <p>Usage Rate: {device.self_reporting.usage_rate}</p>
                <h3>Logs</h3>
                <ul>
                  {device.self_reporting.logs.map((log, index) => (
                    <li key={index}>{log}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceList;

