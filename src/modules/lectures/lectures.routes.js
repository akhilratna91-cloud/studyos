/**
 * StudyOS - Lectures Routes
 */

const { Router } = require('express');
const ctrl = require('./lectures.controller');

const router = Router();

router.get('/', ctrl.getLectures);

module.exports = router;
