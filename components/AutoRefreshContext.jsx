import React, { createContext, useState, useEffect } from 'react';

export const AutoRefreshContext = createContext();

export const AutoRefreshProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [intervalMs, setIntervalMs] = useState(60000); // default 60 seconds

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => setRefreshTrigger(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [autoRefresh, intervalMs]);

  const manualRefresh = () => setRefreshTrigger(Date.now());

  return (
    <AutoRefreshContext.Provider
      value={{
        refreshTrigger,
        manualRefresh,
        autoRefresh,
        setAutoRefresh,
        intervalMs,
        setIntervalMs,
      }}
    >
      {children}
    </AutoRefreshContext.Provider>
  );
};
