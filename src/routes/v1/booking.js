const express = require('express');
const { BookingController } = require('../../controllers');
const { BookingMiddlewares } = require('../../middlewares');
const bookingRouter = express.Router();

bookingRouter.post('/',
    BookingMiddlewares.validateCreateBookingRequest,
    BookingController.createBooking
); 

bookingRouter.post('/payments',
    BookingMiddlewares.validatePaymentRequest,
    BookingController.makePayment
);

module.exports = bookingRouter;