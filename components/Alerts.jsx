import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { AutoRefreshContext } from './AutoRefreshContext';

const AlertsPage = () => {
  const router = useRouter();
  const [devices, setDevices] = useState([]);
  const [alertLevels, setAlertLevels] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({
    device: "",
    level: "",
    email: "",
  });
  const [editingMode, setEditingMode] = useState(false);
  const [showAddRow, setShowAddRow] = useState(false);
  const { refreshTrigger } = useContext(AutoRefreshContext);

  useEffect(() => {
    axios
      .get('/api/alerts')
      .then((res) => {
        setDevices(res.data.devices);
        setAlertLevels(res.data.alertLevels);
        setAlerts(res.data.alerts);
        setNewAlert({
          device: router.query.device || res.data.devices[0] || '',
          level: res.data.alertLevels[0] || '',
          email: '',
        });
        if (router.query.device) {
          setEditingMode(true);
          setShowAddRow(true);
        }
      })
      .catch((err) => console.error('Failed to fetch alerts:', err));
  }, [refreshTrigger, router.query.device]);

  useEffect(() => {
    if (router.isReady && router.query.device) {
      setNewAlert((prev) => ({ ...prev, device: router.query.device }));
    }
  }, [router.isReady, router.query.device]);


  const handleChange = (id, field, value) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, [field]: value } : alert
      )
    );
  };

  const handleNewChange = (field, value) => {
    setNewAlert((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = () => {
    axios
      .post("/api/alert", newAlert)
      .then(() => {
        setAlerts((prev) => [
          ...prev,
          {
            id: Date.now(),
            device: newAlert.device,
            level: newAlert.level,
            lastActivated: "",
            email: newAlert.email,
          },
        ]);
        setNewAlert({
          device: devices[0] || '',
          level: alertLevels[0] || '',
          email: '',
        });
      })
      .catch((err) => console.error("Failed to add alert:", err));
  };

  return (
    <div className="alerts-page-container">
      <div className="header">
        <h1 className="title">Alerts Configuration</h1>
        <div className="actions">
          <button
            className="new-alert-btn"
            onClick={() => {
              setEditingMode(true);
              setShowAddRow(true);
            }}
          >
            Add Alert
          </button>
          <button
            className="edit-toggle-btn"
            onClick={() => setEditingMode((m) => !m)}
          >
            {editingMode ? 'Done' : 'Edit Alerts'}
          </button>
        </div>
      </div>
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
                {editingMode ? (
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
                ) : (
                  alert.device
                )}
              </td>
              <td>
                {editingMode ? (
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
                ) : (
                  alert.level
                )}
              </td>
              <td>{alert.lastActivated}</td>
              <td>
                {editingMode ? (
                  <input
                    type="email"
                    value={alert.email}
                    onChange={(e) => handleChange(alert.id, 'email', e.target.value)}
                  />
                ) : (
                  alert.email
                )}
              </td>
            </tr>
          ))}
        </tbody>
        {editingMode && showAddRow && (
        <tfoot>
          <tr>
            <td>
              <select
                value={newAlert.device}
                onChange={(e) => handleNewChange('device', e.target.value)}
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
                value={newAlert.level}
                onChange={(e) => handleNewChange('level', e.target.value)}
              >
                {alertLevels.map((level, index) => (
                  <option key={index} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </td>
            <td></td>
            <td style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="email"
                value={newAlert.email}
                onChange={(e) => handleNewChange('email', e.target.value)}
              />
              <button onClick={() => { handleAdd(); setShowAddRow(false); }} className="add-alert-btn">+</button>
            </td>
          </tr>
        </tfoot>
        )}
      </table>
    </div>
  );
};

export default AlertsPage;
