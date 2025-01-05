import React, { useState } from 'react';
import './AppList.css';
import { Line } from 'react-chartjs-2';

const AppList = () => {
  const apps = [
    {
      name: 'App 1',
      certificate: 'ABCD1234XYZ',
      nodes: ['Bucharest', 'Arad', 'Timisoara'],
      keyConsumptionMatrix: [
        ['From \\ To', 'Bucharest', 'Arad', 'Timisoara'],
        ['Bucharest', '-', '5kbps', '3kbps'],
        ['Arad', '5kbps', '-', '2kbps'],
        ['Timisoara', '3kbps', '2kbps', '-'],
      ],
      keyConsumptionHistory: [10, 20, 15, 25, 30, 50],
      errorHistory: [0, 1, 0, 2, 1, 3],
      logs: ['Error 1: Key rate mismatch', 'Error 2: Connection lost'],
    },
    {
      name: 'App 2',
      certificate: 'WXYZ5678LMN',
      nodes: ['Cluj', 'Iasi'],
      keyConsumptionMatrix: [
        ['From \\ To', 'Cluj', 'Iasi'],
        ['Cluj', '-', '4kbps'],
        ['Iasi', '4kbps', '-'],
      ],
      keyConsumptionHistory: [5, 10, 7, 15, 12, 20],
      errorHistory: [1, 0, 1, 0, 1, 2],
      logs: ['Error 1: Node timeout'],
    },
  ];

  const renderMatrix = (matrix) => (
    <table className="key-matrix">
      <thead>
        <tr>
          {matrix[0].map((header, index) => (
            <th key={index}>
                {index > 0 ? <a href="#" className="node-link">{header}</a> : header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {matrix.slice(1).map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((value, colIndex) => (
                <td className={colIndex==0 && "matrix-left-header"} key={colIndex}>
                    {colIndex == 0 ? <a href="#" className="node-link">{value}</a> : value}
                </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderLineChart = (label, data, color) => {
    const chartData = {
      labels: ['T-5', 'T-4', 'T-3', 'T-2', 'T-1', 'T-0'],
      datasets: [
        {
          label,
          data,
          borderColor: color,
          backgroundColor: color,
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
          text: label,
        },
      },
    };

    return <Line data={chartData} options={options} />;
  };

  return (
    <div className="app-list-container">
      <h1 className="app-list-title">App List</h1>
      <div className="app-list">
        {apps.map((app, index) => (
          <div key={index} className="app-card">
            <div className="app-header">
              <h2>{app.name}</h2>
              <p><strong>Certificate:</strong> {app.certificate}</p>
            </div>
            <div className="app-details">
              <p><strong>Accessible Nodes:</strong> {app.nodes.map((node, idx) => (
                <a key={idx} href="#" className="node-link">{node}{idx < app.nodes.length - 1 ? ', ' : ''}</a>
              ))}</p>
              <h4>Key Consumption Matrix</h4>
              {renderMatrix(app.keyConsumptionMatrix)}
              <div className="charts-container">
                <div className="chart">
                  {renderLineChart('Key Consumption History', app.keyConsumptionHistory, '#4caf50')}
                </div>
                <div className="chart">
                  {renderLineChart('Error History', app.errorHistory, '#f44336')}
                </div>
              </div>
              <h4>Logs</h4>
              <ul className="log-list">
                {app.logs.map((log, logIndex) => (
                  <li key={logIndex}>{log}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppList;
