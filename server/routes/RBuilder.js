const express = require('express');
const router = express.Router();
const builderController = require('../controllers/CBuilder');
/**
 * @swagger
 * /api/builder/initiate:
 *   post:
 *     tags:
 *     - views
 *     operationId: constructViewByPost
 *     description: creates a new view
 *     consumes:
 *     - application/json
 *     produces:
 *     - application/json
 *     parameters:
 *     - name: taskId
 *       description: if required to poll completion
 *       in: path
 *       required: false
 *     - name: projectId
 *       description: BigQuery Project
 *       in: path
 *       required: true
 *     responses:
 *       200:
 *         description: initiated new trace
 */
router.get('/initiate', builderController.tree_initiate); 


module.exports = router;