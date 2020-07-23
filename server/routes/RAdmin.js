"use strict";
const express = require('express');
const router = express.Router();

const admin_controller = require('../controllers/Cadmin');
module.exports = router;



/**
 * @swagger
 * /api/admin/health:
 *   get:
 *     tags:
 *     - admin
 *     operationId:  healthCheck
 *     description: tests the system for response
 *     responses:
 *       200:
 *         description: content returned
 */
router.get('/health', admin_controller.healthCheck);
