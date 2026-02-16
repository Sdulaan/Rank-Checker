import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import BrandManagement from './components/BrandManagement';
import BrandSearch from './components/BrandSearch';
import SchedulerControl from './components/SchedulerControl';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <h1>Brand Search Application</h1>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <Link to="/search">Search</Link>
            <Link to="/scheduler">Scheduler</Link>
            <Link to="/management">Brand Management</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/search" replace />} />
          <Route path="/search" element={<BrandSearch />} />
          <Route path="/scheduler" element={<SchedulerControl />} />
          <Route path="/management" element={<BrandManagement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
