/**
 * News Intelligence Routes
 * Comprehensive API endpoints for textile industry news
 */

import { Router } from 'express';
import { newsIntelligenceController } from './news-intelligence.controller';

const router = Router();

// Main feed with filtering
router.get('/feed', newsIntelligenceController.getFeed);

// Breaking news
router.get('/breaking', newsIntelligenceController.getBreaking);

// Social media posts
router.get('/social', newsIntelligenceController.getSocial);

// Trending topics
router.get('/trending', newsIntelligenceController.getTrending);

// Region tree for navigation
router.get('/regions', newsIntelligenceController.getRegions);

// Sector statistics
router.get('/sectors', newsIntelligenceController.getSectors);

// News sources
router.get('/sources', newsIntelligenceController.getSources);

// Statistics
router.get('/stats', newsIntelligenceController.getStats);

// Search
router.get('/search', newsIntelligenceController.search);

// Filter by region
router.get('/by-region/:region', newsIntelligenceController.getByRegion);

// Filter by sector
router.get('/by-sector/:sector', newsIntelligenceController.getBySector);

// Refresh cache
router.post('/refresh', newsIntelligenceController.refresh);

export { router as newsIntelligenceRouter };
