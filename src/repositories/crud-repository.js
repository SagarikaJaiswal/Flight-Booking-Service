const { AppError } = require("../utils/errors");
const { StatusCodes } = require("http-status-codes");

class CrudRepository{
    constructor(model){
        this.model = model;
    }
    // data -> {col: value, ...}
    async create(data){
        const response = await this.model.create(data);
        return response;
        
    }
    async get(id){
        const response = await this.model.findByPk(id);
        if(!response){
            throw new AppError("The resource you requested does not exist", StatusCodes.NOT_FOUND);
        }
        return response;
    }
    async getAll(){
        const response = await this.model.findAll();
        return response;        
    }
    async update(id, data){
        const [affectedCount] = await this.model.update(data, {where: {id: id}});
        console.log(affectedCount);
        if(!affectedCount){
            throw new AppError("The resource you tried to update does not exist", StatusCodes.NOT_FOUND);
        }
        return affectedCount;
    }
    async destroy(id){
        const response = await this.model.destroy({where: {id: id}});
        if(!response){
            throw new AppError("The resource you requested does not exist", StatusCodes.NOT_FOUND);
        }
        return response;
    }
}

module.exports = CrudRepository;