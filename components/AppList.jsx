import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AutoRefreshContext } from './AutoRefreshContext';
import TimeRangeMenu from './TimeRangeMenu';
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
  Legend,
);

const AppList = () => {
  const [apps, setApps] = useState([]);
  const [timeBased, setTimeBased] = useState(false);
  const [startTimestamp, setStartTimestamp] = useState(() => {
    const end = new Date();
    return new Date(end.getTime() - 5 * 60 * 1000).toISOString();
  });
  const [endTimestamp, setEndTimestamp] = useState(() => new Date().toISOString());
  const { refreshTrigger } = useContext(AutoRefreshContext);

  useEffect(() => {
    const source = timeBased ? '/api/apps-timeline' : '/api/apps';
    const config = timeBased
      ? { params: { startTimestamp, endTimestamp } }
      : undefined;
    axios
      .get(source, config)
      .then((res) => setApps(res.data))
      .catch((err) => console.error('Failed to fetch apps:', err));
  }, [refreshTrigger, timeBased, startTimestamp, endTimestamp]);

  const handleTimeBasedChange = (value) => {
    setTimeBased(value);
    setApps([]);
    if (value) {
      const end = new Date();
      setEndTimestamp(end.toISOString());
      setStartTimestamp(new Date(end.getTime() - 5 * 60 * 1000).toISOString());
    }
  };

  const renderLineChart = (history, color) => {
    const labels = history.map((h) => h.timestamp);
    const data = history.map((h) => h.keys ?? h.value ?? h.count ?? 0);
    const chartData = {
      labels,
      datasets: [
        {
          label: 'Keys Consumed',
          data,
          borderColor: color,
          backgroundColor: color,
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
          text: 'Key Consumption History',
        },
      },
    };

    return (
      <div className="app-line-chart">
        <Line data={chartData} options={options} />
      </div>
    );
  };

  return (
    <div className="app-list-container">
      <h1 className="app-list-title">App List</h1>
      <div className="time-toggle">
        <span>Time-based data:</span>
        <label>
          <input
            type="radio"
            name="time-based"
            value="off"
            checked={!timeBased}
            onChange={() => handleTimeBasedChange(false)}
          />
          Off
        </label>
        <label>
          <input
            type="radio"
            name="time-based"
            value="on"
            checked={timeBased}
            onChange={() => handleTimeBasedChange(true)}
          />
          On
        </label>
      </div>
      {timeBased && (
        <TimeRangeMenu
          onApply={(start, end) => {
            setStartTimestamp(start);
            setEndTimestamp(end);
          }}
        />
      )}
      <div className="app-list">
        {apps.map((app, index) => (
          <div key={index} className="app-card">
            <div className="app-card-header">
              <h2>{app.name}</h2>
              {!timeBased && (
                <div className="nodes-cert-row">
                  <p className="accessible-nodes">
                    <strong>Accessible Nodes:</strong>{' '}
                    {app.nodes.map((node, idx) => (
                      <a key={idx} href="#" className="node-link">
                        {node}
                        {idx < app.nodes.length - 1 ? ', ' : ''}
                      </a>
                    ))}
                  </p>
                  <div className="certificate-tab">
                    <strong>Certificate:</strong> {app.certificate}
                  </div>
                </div>
              )}
            </div>
            <div className="app-card-body">
              <div className="app-metrics">
                {renderLineChart(app.keyConsumptionHistory, '#4caf50')}
              </div>
              <div className="error-section">
                <div className="error-table-container">
                  <table className="error-table">
                    <tbody>
                      {app.errorHistory.map((err, errIdx) => (
                        <tr key={errIdx}>
                          <td>{err}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="last-error">
                  {app.errorHistory.length > 0
                    ? (() => {
                        const last = app.errorHistory[app.errorHistory.length - 1];
                        const match =
                          typeof last === 'string' && last.match(/\d{4}-\d{2}-\d{2}[^\s]*/);
                        return match ? match[0] : last;
                      })()
                    : 'no errors'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppList;
