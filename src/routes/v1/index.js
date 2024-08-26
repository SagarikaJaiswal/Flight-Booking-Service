const express = require('express');

const { InfoController } = require('../../controllers');

const router = express.Router();
const bookingRouter = require('./booking');

router.get('/info', InfoController.info);

router.use('/bookings', bookingRouter);

 module.exports = router;