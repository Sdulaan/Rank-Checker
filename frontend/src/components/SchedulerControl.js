import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function SchedulerControl() {
  const [status, setStatus] = useState(null);
  const [results, setResults] = useState([]);
  const [intervalHours, setIntervalHours] = useState(2);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchStatus();
    fetchResults();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStatus();
      fetchResults();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/scheduler/status`);
      setStatus(response.data.data);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await axios.get(`${API_BASE}/scheduler/results`);
      setResults(response.data.data);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const startScheduler = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/scheduler/start`, { intervalHours });
      setMessage({ type: 'success', text: `Scheduler started! Will run every ${intervalHours} hours.` });
      setTimeout(() => setMessage(null), 5000);
      fetchStatus();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to start scheduler' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const stopScheduler = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/scheduler/stop`);
      setMessage({ type: 'success', text: 'Scheduler stopped successfully' });
      setTimeout(() => setMessage(null), 5000);
      fetchStatus();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to stop scheduler' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem', color: '#2c3e50' }}>Automated Scheduler</h1>

      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <h2>Scheduler Control</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
          Automatically search all brands at regular intervals throughout the day.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#2c3e50' }}>Status</h3>
            <div style={{ 
              padding: '1rem', 
              backgroundColor: status?.isRunning ? '#d4edda' : '#f8d7da',
              borderRadius: '4px',
              color: status?.isRunning ? '#155724' : '#721c24'
            }}>
              <strong>{status?.isRunning ? '🟢 Running' : '🔴 Stopped'}</strong>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#2c3e50' }}>Statistics</h3>
            <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <div>Brands Searched: <strong>{status?.totalBrandsSearched || 0}</strong></div>
              <div>Last Run: <strong>{formatDate(status?.lastSearchTime)}</strong></div>
            </div>
          </div>
        </div>

        <div className="flex" style={{ gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Search Interval (hours)
            </label>
            <input
              type="number"
              min="1"
              max="24"
              value={intervalHours}
              onChange={(e) => setIntervalHours(parseInt(e.target.value))}
              disabled={status?.isRunning}
              style={{
                width: '100%',
                padding: '0.6rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
            <small style={{ color: '#7f8c8d', fontSize: '0.875rem' }}>
              Recommended: 2-4 hours for 34 brands
            </small>
          </div>

          {!status?.isRunning ? (
            <button
              onClick={startScheduler}
              disabled={loading}
              className="btn btn-success"
              style={{ minWidth: '150px' }}
            >
              {loading ? 'Starting...' : 'Start Scheduler'}
            </button>
          ) : (
            <button
              onClick={stopScheduler}
              disabled={loading}
              className="btn btn-danger"
              style={{ minWidth: '150px' }}
            >
              {loading ? 'Stopping...' : 'Stop Scheduler'}
            </button>
          )}
        </div>

        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#fff3cd', 
          borderRadius: '4px',
          color: '#856404',
          fontSize: '0.9rem'
        }}>
          <strong>⚠️ Important:</strong> The scheduler automatically adds delays between searches (5-10 seconds) 
          to avoid Google blocking. With 34 brands, each full run takes about 3-6 minutes.
        </div>
      </div>

      {results.length > 0 && (
        <div className="card">
          <div className="flex-between mb-2">
            <h2>Latest Results</h2>
            <button onClick={fetchResults} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
              Refresh
            </button>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Last Searched</th>
                <th>Results</th>
                <th>Ours</th>
                <th>Not Ours</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td><strong>{result.brand}</strong></td>
                  <td style={{ fontSize: '0.875rem' }}>
                    {new Date(result.timestamp).toLocaleString()}
                  </td>
                  <td>{result.totalResults}</td>
                  <td>
                    <span className="badge badge-success">
                      {result.ownedCount}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-danger">
                      {result.notOwnedCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card" style={{ backgroundColor: '#e7f3ff' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>💡 Tips for Best Results</h3>
        <ul style={{ marginLeft: '1.5rem', color: '#555', lineHeight: '1.8' }}>
          <li><strong>Start with 2-hour intervals</strong> - This gives you 12 searches per day (34 brands × 12 = 408 searches)</li>
          <li><strong>Monitor for blocking</strong> - If you see many failures, increase the interval to 3-4 hours</li>
          <li><strong>Best times:</strong> Early morning, midday, and evening searches often work better</li>
          <li><strong>Let it run:</strong> The scheduler automatically retries failed searches and waits when blocked</li>
          <li><strong>View logs:</strong> Check the backend console for detailed search progress and any issues</li>
        </ul>
      </div>
    </div>
  );
}

export default SchedulerControl;
