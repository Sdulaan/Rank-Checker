const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const searchController = require('../controllers/searchController');

// Brand routes
router.get('/brands', brandController.getAllBrands);
router.get('/brands/:id', brandController.getBrandById);
router.post('/brands', brandController.createBrand);
router.put('/brands/:id', brandController.updateBrand);
router.delete('/brands/:id', brandController.deleteBrand);

// Domain routes
router.post('/brands/:brandId/domains', brandController.addDomain);
router.delete('/domains/:domainId', brandController.deleteDomain);

// Search routes
router.post('/search/:brandId', searchController.searchBrand);

// Scheduler routes
const searchScheduler = require('../services/searchScheduler');

// Start scheduler
router.post('/scheduler/start', (req, res) => {
  try {
    const intervalHours = req.body.intervalHours || 2;
    searchScheduler.start(intervalHours);
    res.json({ 
      success: true, 
      message: `Scheduler started with ${intervalHours} hour interval` 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stop scheduler
router.post('/scheduler/stop', (req, res) => {
  try {
    searchScheduler.stop();
    res.json({ success: true, message: 'Scheduler stopped' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get scheduler status
router.get('/scheduler/status', (req, res) => {
  try {
    const status = searchScheduler.getStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all latest results from scheduler
router.get('/scheduler/results', (req, res) => {
  try {
    const results = searchScheduler.getAllLatestResults();
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
