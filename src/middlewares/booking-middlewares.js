const { ErrorResponse } = require('../utils/common');
const { AppError } = require('../utils/errors');
const { StatusCodes } = require("http-status-codes");

function validateCreateBookingRequest(req, res, next){
    if(!req.body.flightId){
        ErrorResponse.message = "Something went wrong while booking the flight";
        ErrorResponse.error =  new AppError(["flightId to be booked not found in incoming request"], StatusCodes.BAD_REQUEST);
        return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ErrorResponse);
    }
    if(!req.body.userId){
        ErrorResponse.message = "Something went wrong while booking the flight";
        ErrorResponse.error =  new AppError(["userId to be booked not found in incoming request"], StatusCodes.BAD_REQUEST);
        return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ErrorResponse);
    }
    if(!req.body.noOfSeats){
        ErrorResponse.message = "Something went wrong while booking the flight";
        ErrorResponse.error =  new AppError(["noOfSeats to be booked not found in incoming request"], StatusCodes.BAD_REQUEST);
        return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ErrorResponse);
    }
    next();
}

function validatePaymentRequest(req, res, next){
    if(!req.body.bookingId){
        ErrorResponse.message = "Something went wrong while booking the flight";
        ErrorResponse.error =  new AppError(["flightId to be booked not found in incoming request"], StatusCodes.BAD_REQUEST);
        return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ErrorResponse);
    }
    if(!req.body.userId){
        ErrorResponse.message = "Something went wrong while booking the flight";
        ErrorResponse.error =  new AppError(["userId to be booked not found in incoming request"], StatusCodes.BAD_REQUEST);
        return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ErrorResponse);
    }
    if(!req.body.totalCost){
        ErrorResponse.message = "Something went wrong while booking the flight";
        ErrorResponse.error =  new AppError(["totalCost to be booked not found in incoming request"], StatusCodes.BAD_REQUEST);
        return res
        .status(StatusCodes.BAD_REQUEST)
        .json(ErrorResponse);
    }
    next();
}

module.exports = {
    validateCreateBookingRequest,
    validatePaymentRequest
}