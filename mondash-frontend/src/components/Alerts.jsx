import React, { useState } from 'react';
import './Alerts.css';

const AlertsPage = () => {
  const devices = ['Device 1', 'Device 2', 'Device 3']; // Example devices
  const alertLevels = ['On Warning Logs', 'On Key Error', 'On Full Shutdown'];

  const initialAlerts = [
    {
      id: 1,
      device: 'Device 1',
      level: 'On Key Error',
      lastActivated: '2024-12-30 14:30',
      email: 'user1@example.com',
    },
    {
      id: 2,
      device: 'Device 2',
      level: 'On Full Shutdown',
      lastActivated: '2024-12-25 10:15',
      email: 'user2@example.com',
    },
  ];

  const [alerts, setAlerts] = useState(initialAlerts);

  const handleChange = (id, field, value) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, [field]: value } : alert
      )
    );
  };

  return (
    <div className="alerts-page-container">
      <h1 className="alerts-title">Alerts Configuration</h1>
      <table className="alerts-table">
        <thead>
          <tr>
            <th>Device</th>
            <th>Alert Level</th>
            <th>Last Activated</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.id}>
              <td>
                <select
                  value={alert.device}
                  onChange={(e) => handleChange(alert.id, 'device', e.target.value)}
                >
                  {devices.map((device, index) => (
                    <option key={index} value={device}>
                      {device}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  value={alert.level}
                  onChange={(e) => handleChange(alert.id, 'level', e.target.value)}
                >
                  {alertLevels.map((level, index) => (
                    <option key={index} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </td>
              <td>{alert.lastActivated}</td>
              <td>
                <input
                  type="email"
                  value={alert.email}
                  onChange={(e) => handleChange(alert.id, 'email', e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlertsPage;
