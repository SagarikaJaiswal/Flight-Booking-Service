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
            await cancelBooking(data.bookingId);
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
 
/**
 * create a cancel booking api which is called automatically every 5 min
 * to check if the 5 min has passed since the booking is initiated and cancels it
 * After cancelling we also have to increase the seats and update the bookingStatus in the gb
 */

async function cancelBooking(bookingId) {
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails = await bookingRepository.get(bookingId, transaction);
        if(bookingDetails.status == CANCELLED){
            await transaction.commit();
            return true;
        }
        const response = await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`,{
            seats: bookingDetails.noOfSeats,
            dec: 0
        });
        await bookingRepository.update(bookingId, {status: CANCELLED}, transaction);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}
module.exports = {
    createBooking,
    makePayment
}