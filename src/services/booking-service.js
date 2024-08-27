const axios = require('axios');
const db = require('../models');
const { AppError } = require('../utils/errors');
const { StatusCodes } = require('http-status-codes');
const { ServerConfig } = require('../config');
const BookingRepository = require('../repositories/booking-repository');
const { Enums } = require('../utils/common');
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;

const bookingRepository = new BookingRepository();

async function createBooking(data){
    const transaction = await db.sequelize.transaction();
    try {
        const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
        const flightData = flight.data.data;
        //console.log(flight.data);
        if(data.noOfSeats > flightData.totalSeats){
            throw new AppError('Requested seats exceeds the currently available seats', StatusCodes.BAD_REQUEST);
        }
        /**
         * 1- calculate total billing amount
         * 2- create new booking in the db with status as initiated(default)
         * 3- make a updateSeats request to flight service to reserve the seats
         * 4- if the payment is successfull within a certain time span update the status to be booked
         * 5- if payment fails again update the seats 
         */
        const totalBillingCost = data.noOfSeats * flightData.price;
        //console.log(totalBillingCost);
        const bookingPayload = {...data, totalCost: totalBillingCost};
        const newBooking = await bookingRepository.create(bookingPayload, transaction);
        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`,{
            seats: data.noOfSeats
        });
        await transaction.commit();
        return newBooking;
    } catch (error) {
        await transaction.rollback();
        //console.log(error);
        throw new AppError(error, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

// api to mimic payment gateway
async function makePayment(data) {
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails = await bookingRepository.get(data.bookingId, transaction);
        if(bookingDetails.status == CANCELLED){
            throw new AppError('The booking has cancelled', StatusCodes.BAD_REQUEST);
        }
        const bookingTime = new Date(bookingDetails.createdAt);
        const currentTime = new Date();
        if(currentTime - bookingTime > 300000){
            await bookingRepository.update(data.bookingId, {status: CANCELLED}, transaction);
            throw new AppError('The booking has expired', StatusCodes.BAD_REQUEST); 
        }
        if(bookingDetails.totalCost != data.totalCost){
            throw new AppError('The amount of payment does not match', StatusCodes.BAD_REQUEST);
        }
        if(bookingDetails.userId != data.userId){
            throw new AppError('The user corresponding to the booking doesnt match', StatusCodes.BAD_REQUEST);
        }
        // we assume here that payment is successful
        await bookingRepository.update(data.bookingId, {status: BOOKED}, transaction);
        await transaction.commit();
        //return response;
    } catch (error) {
        await transaction.rollback();
        //console.log(error);
        throw new AppError(error, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}
module.exports = {
    createBooking,
    makePayment
}