const CrudRepository = require("./crud-repository");
const { Booking } = require("../models");

class BookingRepository extends CrudRepository {
    constructor() {
        super(Booking)
    }
    async create(data, transaction) {
        const response = await Booking.create(data);
        return response;
    }
}

module.exports = BookingRepository;