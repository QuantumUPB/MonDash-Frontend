import React from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import MapView from './components/MapView';
import DeviceList from './components/DeviceList';
import NodeList from './components/NodeList';
import AppsConsumption from './components/AppsConsumption';
import Register from './pages/Register';
import Login from './pages/Login';
import './App.css';
import ProtectedRoute from './utils/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="app-container">
        <aside className="sidebar">
          <h1 className="sidebar-title">MonDash</h1>
          <nav>
            <ul className="nav-links">
              <li><NavLink to="/" className="nav-link" activeClassName="active-link">Map</NavLink></li>
              <li><NavLink to="/devices" className="nav-link" activeClassName="active-link">Devices</NavLink></li>
              <li><NavLink to="/nodes" className="nav-link" activeClassName="active-link">Nodes</NavLink></li>
              <li><NavLink to="/apps" className="nav-link" activeClassName="active-link">Apps</NavLink></li>
            </ul>
            <div className="auth-links">
              <ul>
                <li><NavLink to="/login" className="nav-link" activeClassName="active-link">Login</NavLink></li>
                <li><NavLink to="/register" className="nav-link" activeClassName="active-link">Register</NavLink></li>
              </ul>
              <div className="about">
                <div className="logos">
                  <img src="ronaqci.png" alt="logo" />
                  <img src="upb.png" alt="logo" />
                </div>
              </div>
            </div>
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<MapView />} />
            <Route path="/devices" element={<ProtectedRoute><DeviceList /></ProtectedRoute>} />
            <Route path="/nodes" element={<ProtectedRoute><NodeList /></ProtectedRoute>} />
            <Route path="/apps" element={<ProtectedRoute><AppsConsumption /></ProtectedRoute>} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
