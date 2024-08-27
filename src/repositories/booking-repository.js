const CrudRepository = require("./crud-repository");
const { Booking } = require("../models");

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
}

module.exports = BookingRepository;