const { Op } = require('sequelize');

const CrudRepository = require("./crud-repository");
const { Booking } = require("../models");
const { BOOKING_STATUS } = require('../utils/common/enums');
const { CANCELLED, BOOKED } = BOOKING_STATUS;
class BookingRepository extends CrudRepository {
    constructor() {
        super(Booking)
    }
    async create(data, transaction) {
        const response = await Booking.create(data, {transaction: transaction});
        return response;
    }
    async get(id, transaction){
        const response = await this.model.findByPk(id, {transaction: transaction});
        if(!response){
            throw new AppError("The resource you requested does not exist", StatusCodes.NOT_FOUND);
        }
        return response;
    }
    async update(id, data, transaction){
        const [affectedCount] = await this.model.update(data, {where: {id: id}}, {transaction: transaction});
        console.log(affectedCount);
        if(!affectedCount){
            throw new AppError("The resource you tried to update does not exist", StatusCodes.NOT_FOUND);
        }
        return affectedCount;
    }

    async cancelOldBookings(timestamp) {
        const [affectedCount] = await Booking.update(
            { 
            status: CANCELLED 
            },
            {
                where: {
                    createdAt: {
                        [Op.lt]: timestamp 
                    },
                    status: {
                        [Op.notIn]: [CANCELLED, BOOKED]
                    }
                }
            }
        );

        return affectedCount;
    }

}

module.exports = BookingRepository;