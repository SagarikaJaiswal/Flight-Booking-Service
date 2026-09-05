const { BookingService } = require('../services');
const { SuccessResponse, ErrorResponse} = require('../utils/common');
const { StatusCodes } = require('http-status-codes');

const inMemoryDb = {};
async function createBooking(req, res) {
    try {
        const response = await BookingService.createBooking({
            flightId: req.body.flightId,
            userId: req.body.userId,
            noOfSeats: req.body.noOfSeats
        });
        SuccessResponse.data = response;
        return res
        .status(StatusCodes.OK)
        .json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res
        .status(error.statusCode)
        .json(ErrorResponse);
    }
}

async function makePayment(req, res) {
    try {
        const idempotencyKey = req.headers['x-idempotency-key'];
        if(!idempotencyKey){
            return res
            .status(StatusCodes.BAD_REQUEST)
            .json({message: 'Idempotency key is required'});
        }
        if(inMemoryDb[idempotencyKey]){
            return res
            .status(StatusCodes.BAD_REQUEST)
            .json("Cannot retry on successful payment");
        }
        const response = await BookingService.makePayment({
            bookingId: req.body.bookingId,
            userId: req.body.userId,
            totalCost: req.body.totalCost
        });
        SuccessResponse.data = response;
        inMemoryDb[idempotencyKey] = idempotencyKey;
        return res
        .status(StatusCodes.OK)
        .json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res
        .status(error.statusCode)
        .json(ErrorResponse);
    }
}
module.exports ={
    createBooking,
    makePayment
}