import React, { useContext } from 'react';
import { AutoRefreshContext } from './AutoRefreshContext';

const intervals = [
  { label: 'Off', value: 0 },
  { label: '10s', value: 10000 },
  { label: '30s', value: 30000 },
  { label: '1m', value: 60000 },
  { label: '5m', value: 300000 },
];

const AutoRefreshMenu = () => {
  const {
    manualRefresh,
    autoRefresh,
    setAutoRefresh,
    intervalMs,
    setIntervalMs,
  } = useContext(AutoRefreshContext);

  const handleIntervalChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setIntervalMs(val);
    if (val === 0) {
      setAutoRefresh(false);
    }
  };

  return (
    <div className="autorefresh-menu">
      <button onClick={manualRefresh}>Refresh Now</button>
      <button onClick={() => setAutoRefresh(!autoRefresh)}>
        {autoRefresh ? 'Stop Auto' : 'Start Auto'}
      </button>
      <select value={intervalMs} onChange={handleIntervalChange}>
        {intervals.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AutoRefreshMenu;
