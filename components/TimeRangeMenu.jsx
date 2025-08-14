import React, { useState } from 'react';

/**
 * Time range selector that allows choosing an end time and a start time
 * relative to that end. The end time defaults to the current time while
 * the start time is represented as "N units ago" where the unit can be
 * seconds, minutes, hours or days.
 */
const TimeRangeMenu = ({ onApply }) => {
  const [relativeValue, setRelativeValue] = useState(5);
  const [relativeUnit, setRelativeUnit] = useState('minutes');
  const [endTime, setEndTime] = useState(() => {
    const now = new Date();
    // Convert to local ISO string without timezone offset for datetime-local
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  });

  const applyRange = () => {
    const end = new Date(endTime);
    const multipliers = {
      seconds: 1000,
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
    };
    const start = new Date(
      end.getTime() - relativeValue * multipliers[relativeUnit]
    );
    if (onApply) {
      onApply(start.toISOString(), end.toISOString());
    }
  };

  return (
    <div className="time-range-menu">
      <label className="relative-start">
        Start:
        <input
          type="number"
          min="0"
          value={relativeValue}
          onChange={(e) => setRelativeValue(e.target.value)}
        />
        <select
          value={relativeUnit}
          onChange={(e) => setRelativeUnit(e.target.value)}
        >
          <option value="seconds">Seconds</option>
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
          <option value="days">Days</option>
        </select>
        <span>ago</span>
      </label>
      <label>
        End:
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </label>
      <button onClick={applyRange}>Apply</button>
    </div>
  );
};

export default TimeRangeMenu;
