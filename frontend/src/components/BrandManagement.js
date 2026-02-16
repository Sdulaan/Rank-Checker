import React, { useState, useEffect } from 'react';
import { brandAPI, domainAPI } from '../services/api';

function BrandManagement() {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [newBrandName, setNewBrandName] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await brandAPI.getAll();
      setBrands(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch brands');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandDetails = async (brandId) => {
    try {
      const response = await brandAPI.getById(brandId);
      setSelectedBrand(response.data.data);
    } catch (err) {
      setError('Failed to fetch brand details');
      console.error(err);
    }
  };

  const handleCreateBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    try {
      await brandAPI.create(newBrandName);
      setNewBrandName('');
      setSuccess('Brand created successfully');
      fetchBrands();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create brand');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteBrand = async (brandId) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;

    try {
      await brandAPI.delete(brandId);
      setSuccess('Brand deleted successfully');
      fetchBrands();
      if (selectedBrand?.id === brandId) {
        setSelectedBrand(null);
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete brand');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleAddDomain = async (e) => {
    e.preventDefault();
    if (!newDomain.trim() || !selectedBrand) return;

    try {
      await domainAPI.add(selectedBrand.id, newDomain);
      setNewDomain('');
      setSuccess('Domain added successfully');
      fetchBrandDetails(selectedBrand.id);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add domain');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteDomain = async (domainId) => {
    if (!window.confirm('Are you sure you want to delete this domain?')) return;

    try {
      await domainAPI.delete(domainId);
      setSuccess('Domain deleted successfully');
      fetchBrandDetails(selectedBrand.id);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete domain');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return <div className="loading">Loading brands</div>;
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem', color: '#2c3e50' }}>Brand Management</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h2>Create New Brand</h2>
        <form onSubmit={handleCreateBrand} className="flex">
          <input
            type="text"
            placeholder="Enter brand name"
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
            style={{ flex: 1, padding: '0.6rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <button type="submit" className="btn btn-primary">
            Add Brand
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h2>Brands List ({brands.length})</h2>
          {brands.length === 0 ? (
            <p style={{ color: '#7f8c8d' }}>No brands yet. Create your first brand above.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Brand Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id}>
                    <td>
                      <button
                        onClick={() => fetchBrandDetails(brand.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#3498db',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          textDecoration: selectedBrand?.id === brand.id ? 'underline' : 'none',
                          fontWeight: selectedBrand?.id === brand.id ? 'bold' : 'normal'
                        }}
                      >
                        {brand.name}
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteBrand(brand.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h2>Brand Domains</h2>
          {!selectedBrand ? (
            <p style={{ color: '#7f8c8d' }}>Select a brand to manage its domains</p>
          ) : (
            <>
              <h3 style={{ color: '#3498db', marginBottom: '1rem' }}>{selectedBrand.name}</h3>
              
              <form onSubmit={handleAddDomain} className="mb-2">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="example.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    style={{ flex: 1, padding: '0.6rem', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                  <button type="submit" className="btn btn-success">
                    Add Domain
                  </button>
                </div>
              </form>

              {selectedBrand.domains && selectedBrand.domains.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Domain</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBrand.domains.map((domain) => (
                      <tr key={domain.id}>
                        <td>{domain.domain}</td>
                        <td>
                          <button
                            onClick={() => handleDeleteDomain(domain.id)}
                            className="btn btn-danger"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#7f8c8d', marginTop: '1rem' }}>
                  No domains added yet. Add domains above.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BrandManagement;
