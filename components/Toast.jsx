import React, { useEffect } from 'react';

const Toast = ({ message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  return (
    <div className="toast">
      {message}
    </div>
  );
};

export default Toast;
