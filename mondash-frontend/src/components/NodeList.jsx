import React, { useState } from 'react';
import { useRef } from 'react';
import './NodeList.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const NodeList = () => {
  const nodes = [
    {
      id: 'Bucharest',
      name: 'Bucharest',
      kme: 'KME-1',
      coordinates: { lat: 44.4268, long: 26.1025 },
      type: 'End Point',
      status: 'Active',
      connections: [
        { device: 'UPB-1-A', otherNode: 'Arad' },
        { device: 'UPB-1-B', otherNode: 'Timisoara' },
      ],
      apps: ['App 1', 'App 2', 'App 3'],
      requests: {
        totalOverTime: [10, 20, 30, 40, 35, 50],
        byApp: [
          { app: 'App 1', percentage: 50 },
          { app: 'App 2', percentage: 30 },
          { app: 'App 3', percentage: 10 },
        ],
      },
    },
    {
      id: 'Arad',
      name: 'Arad',
      kme: 'KME-2',
      coordinates: { lat: 46.1866, long: 21.3123 },
      type: 'Connection',
      status: 'Active',
      connections: [
        { device: 'UPB-1-A', otherNode: 'Bucharest' },
      ],
      apps: ['App 1'],
      requests: {
        totalOverTime: [5, 15, 10, 25, 30, 40],
        byApp: [
          { app: 'App 1', percentage: 80 },
        ],
      },
    },
  ];

  const [expandedNode, setExpandedNode] = useState(null);
  const [showRequests, setShowRequests] = useState(false);
  const [highlighted, setHighlighted] = useState(null);
  const nodeRefs = useRef({});
  const renderRequestChart = (requests) => {
    const data = {
      labels: ['T-5', 'T-4', 'T-3', 'T-2', 'T-1', 'T-0'],
      datasets: [
        {
          label: 'Requests Over Time',
          data: requests.totalOverTime,
          borderColor: '#4caf50',
          backgroundColor: '#4caf50',
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Requests Over Time',
        },
      },
    };

    return (
        <div className="line-chart">
          <Line data={data} options={options} />
        </div>
      );
  };

  const renderPercentageChart = (requests) => {
    const totalPercentage = requests.byApp.reduce((sum, app) => sum + app.percentage, 0);
    const otherPercentage = 100 - totalPercentage;

    return (
        <div className="percentage-chart-container">
          <h4 className="chart-subtitle">App Usage Breakdown (Last 24h)</h4>
          <div className="percentage-chart">
            {requests.byApp.map((appData, index) => (
              <div
                key={index}
                className="percentage-bar"
                style={{ width: `${appData.percentage}%`, backgroundColor: '#888' }}
                title={`${appData.app}: ${appData.percentage}%`}
              >
                {appData.app}
              </div>
            ))}
            {otherPercentage > 0 && (
              <div
                className="percentage-bar"
                style={{ width: `${otherPercentage}%`, backgroundColor: '#555' }}
                title={`Other: ${otherPercentage}%`}
              >
                Other
              </div>
            )}
          </div>
        </div>
      );
  };

  const handleNodeClick = (nodeId) => {
    const target = nodeRefs.current[nodeId];
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
        // Highlight the device
        setHighlighted(nodeId);
        setTimeout(() => setHighlighted(null), 2000); // Remove highlight after 2 seconds
    }
  };
  

  return (
    <div className="node-list-container">
      <h1 className="node-list-title">Node List</h1>
      <div className="node-list">
        {nodes.map((node) => (
          <div key={node.id} className={`node-card ${highlighted === node.id ? 'highlight' : ''}`}
           ref={(el) => (nodeRefs.current[node.id] = el)}>
            <div className="node-header">
              <h2>{node.name}</h2>
              <p>Status: <span className={`status-badge ${node.status.toLowerCase()}`}>{node.status}</span></p>
            </div>
            <div className="node-details">
              <p><strong>Node ID:</strong> {node.id}</p>
              <p><strong>KME:</strong> {node.kme}</p>
              <p><strong>Coordinates:</strong> Lat {node.coordinates.lat}, Long {node.coordinates.long}</p>
              <p><strong>Type:</strong> {node.type}</p>
              <h4>
                <button
                    className="connections-toggle"
                    onClick={() =>
                    setExpandedNode(expandedNode === node.id ? null : node.id)
                    }
                >
                    Connections ({node.connections.length}) {expandedNode === node.id ? '▼' : '▶'}
                </button>
              </h4>

              {expandedNode === node.id && (
                <ul>
                  {node.connections.map((conn, index) => (
                    <li key={index}>
                      Connected via <a href="#" className="device-link">{conn.device}</a> to <a href="#" onClick={() => handleNodeClick(conn.otherNode)} className="node-link">{conn.otherNode}</a>
                    </li>
                  ))}
                </ul>
              )}
              <h4>
                <button
                    className="applications-toggle"
                    onClick={() =>
                    setExpandedNode(expandedNode === `${node.id}-apps` ? null : `${node.id}-apps`)
                    }
                >
                    Applications ({node.apps.length}) {expandedNode === `${node.id}-apps` ? '▼' : '▶'}
                </button>
                </h4>
                {expandedNode === `${node.id}-apps` && (
                <div className="applications-container">
                    {node.apps.map((app, index) => (
                    <span key={index} className="app-label">
                        {app}
                    </span>
                    ))}
                </div>
                )}

            </div>
            <button
              className="show-requests-btn"
              onClick={() => setShowRequests(showRequests === node.id ? null : node.id)}
            >
              {showRequests === node.id ? 'Hide Requests' : 'Show Requests'}
            </button>
            {showRequests === node.id && (
              <div className="charts-container">
                {renderRequestChart(node.requests)}
                {renderPercentageChart(node.requests)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodeList;
