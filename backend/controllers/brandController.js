const pool = require('../config/database');

class BrandController {
  // Get all brands
  async getAllBrands(req, res) {
    try {
      const result = await pool.query(
        'SELECT * FROM brands ORDER BY name ASC'
      );
      res.json({ success: true, data: result.rows });
    } catch (error) {
      console.error('Error fetching brands:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get single brand with its domains
  async getBrandById(req, res) {
    try {
      const { id } = req.params;
      
      const brandResult = await pool.query(
        'SELECT * FROM brands WHERE id = $1',
        [id]
      );
      
      if (brandResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Brand not found' });
      }
      
      const domainsResult = await pool.query(
        'SELECT * FROM brand_domains WHERE brand_id = $1 ORDER BY domain ASC',
        [id]
      );
      
      const brand = {
        ...brandResult.rows[0],
        domains: domainsResult.rows
      };
      
      res.json({ success: true, data: brand });
    } catch (error) {
      console.error('Error fetching brand:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Create new brand
  async createBrand(req, res) {
    try {
      const { name } = req.body;
      
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Brand name is required' });
      }
      
      const result = await pool.query(
        'INSERT INTO brands (name) VALUES ($1) RETURNING *',
        [name.trim()]
      );
      
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(409).json({ success: false, error: 'Brand name already exists' });
      }
      console.error('Error creating brand:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Update brand
  async updateBrand(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Brand name is required' });
      }
      
      const result = await pool.query(
        'UPDATE brands SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [name.trim(), id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Brand not found' });
      }
      
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(409).json({ success: false, error: 'Brand name already exists' });
      }
      console.error('Error updating brand:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Delete brand
  async deleteBrand(req, res) {
    try {
      const { id } = req.params;
      
      const result = await pool.query(
        'DELETE FROM brands WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Brand not found' });
      }
      
      res.json({ success: true, message: 'Brand deleted successfully' });
    } catch (error) {
      console.error('Error deleting brand:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Add domain to brand
  async addDomain(req, res) {
    try {
      const { brandId } = req.params;
      const { domain } = req.body;
      
      if (!domain || !domain.trim()) {
        return res.status(400).json({ success: false, error: 'Domain is required' });
      }
      
      // Check if brand exists
      const brandCheck = await pool.query(
        'SELECT id FROM brands WHERE id = $1',
        [brandId]
      );
      
      if (brandCheck.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Brand not found' });
      }
      
      const result = await pool.query(
        'INSERT INTO brand_domains (brand_id, domain) VALUES ($1, $2) RETURNING *',
        [brandId, domain.trim().toLowerCase()]
      );
      
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(409).json({ success: false, error: 'Domain already exists for this brand' });
      }
      console.error('Error adding domain:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Delete domain from brand
  async deleteDomain(req, res) {
    try {
      const { domainId } = req.params;
      
      const result = await pool.query(
        'DELETE FROM brand_domains WHERE id = $1 RETURNING *',
        [domainId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Domain not found' });
      }
      
      res.json({ success: true, message: 'Domain deleted successfully' });
    } catch (error) {
      console.error('Error deleting domain:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new BrandController();
