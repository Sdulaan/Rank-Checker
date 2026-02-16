import React, { useState, useEffect } from 'react';
import { brandAPI, searchAPI } from '../services/api';

function BrandSearch() {
  const [brands, setBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await brandAPI.getAll();
      setBrands(response.data.data);
    } catch (err) {
      setError('Failed to fetch brands');
      console.error(err);
    }
  };

  const handleSearch = async () => {
    if (!selectedBrandId) {
      setError('Please select a brand');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearchResults(null);
      
      const response = await searchAPI.searchBrand(selectedBrandId);
      setSearchResults(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search brand');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem', color: '#2c3e50' }}>Brand Search</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <h2>Search Google for Brand</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '1rem' }}>
          Select a brand to search Google Indonesia and see which top 10 results are yours.
        </p>
        
        <div className="flex">
          <div style={{ flex: 1 }}>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '1rem'
              }}
            >
              <option value="">-- Select a Brand --</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !selectedBrandId}
            className="btn btn-primary"
            style={{ minWidth: '120px' }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {brands.length === 0 && (
          <p style={{ color: '#e74c3c', marginTop: '1rem' }}>
            No brands available. Please add brands in the Brand Management page first.
          </p>
        )}
      </div>

      {loading && (
        <div className="card">
          <div className="loading">Searching Google Indonesia for results</div>
        </div>
      )}

      {searchResults && (
        <div className="card">
          <div className="flex-between mb-2">
            <h2>Search Results for "{searchResults.brand}"</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="badge badge-success">
                Ours: {searchResults.ownedCount}
              </div>
              <div className="badge badge-danger">
                Not Ours: {searchResults.notOwnedCount}
              </div>
            </div>
          </div>

          {searchResults.results.length === 0 ? (
            <div className="alert alert-info">
              No results found. This might happen if Google is blocking the requests or if the search failed.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Position</th>
                  <th>Domain</th>
                  <th>Title</th>
                  <th style={{ width: '120px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.results.map((result) => (
                  <tr key={result.position}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                      #{result.position}
                    </td>
                    <td>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#3498db', textDecoration: 'none' }}
                      >
                        {result.domain}
                      </a>
                    </td>
                    <td style={{ fontSize: '0.9rem', color: '#555' }}>
                      {result.title}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          result.isOwned ? 'badge-success' : 'badge-danger'
                        }`}
                        style={{ fontSize: '0.875rem' }}
                      >
                        {result.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default BrandSearch;
