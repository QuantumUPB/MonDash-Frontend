import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AppsConsumption() {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    // Replace with backend endpoint
    axios.get('/api/apps')
      .then(response => setApps(response.data))
      .catch(error => console.error('Error fetching apps:', error));
  }, []);

  return (
    <div>
      <h1>App Consumption</h1>
      <table>
        <thead>
          <tr>
            <th>App</th>
            <th>Consumption Rate</th>
          </tr>
        </thead>
        <tbody>
          {apps.map(app => (
            <tr key={app.name}>
              <td>{app.name}</td>
              <td>{app.consumptionRate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AppsConsumption;
