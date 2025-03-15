const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const OperationModel = require(path.join(paths.MDL_DIR, 'OperationModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class Operation{
    constructor(id = null, guid = null, code, name, viewing, color, created) {
        this.id = id;
        this.guid = guid;
        this.code = code;
        this.name = name;
        this.viewing = viewing;
        this.color = color;
        this.created = created
    }

    static fromJson(json){
        return new Operation(
            json.id, json.guid, json.code, json.name, json.viewing, json.color, json.created
        )
    }

    async _duplicate() {
        const existingEntry = await OperationModel.findOne({
            where: { code: this.code }
        });
        await W.isOccur(existingEntry, W.duplicate);
    }

    async save(){
        try {
            await W.isOccur(!OperationModel, 'OperationModel is not properly initialized');
            let entry;
            if (!this.guid){
                await this._duplicate();

                const db = new Db();
                const guid = await db.generateGuid(OperationModel, 6);
                entry = await OperationModel.create({
                    guid: guid,
                    code: this.code,
                    name: this.name,
                    viewing: this.viewing,
                    color: this.color
                })
            }
            else {
                const existingEntry = await OperationModel.findOne({
                    where: { guid: this.guid }
                });
                await W.isOccur(!existingEntry, W.errorGuid);

                await OperationModel.update(
                    {
                        code: this.code,
                        name: this.name,
                        viewing: this.viewing,
                        color: this.color
                    },
                    {
                        where: { guid: this.guid }
                    });
                entry = await OperationModel.findOne({
                    where: { guid: this.guid }
                });
            }
            return Operation.fromJson(entry.toJSON());
        } catch (error){
            throw error;
        }
    }
    static async getByGuid(guid){
        try {
            const result = await OperationModel.findOne({
                where: { guid : guid }
            });
            if (!result){
                return false;
            }
            return Operation.fromJson(result.toJSON());
        } catch (error){
            throw error;
        }
    }
    static async getById(id){
        try {
            const result = await OperationModel.findOne({
                where: { id : id }
            });
            if (!result){
                return false;
            }
            return Operation.fromJson(result.toJSON());
        } catch (error){
            throw error;
        }
    }
    static async getOperationByCode(){
        try {
            const result = await OperationModel.findOne({
                where: { code : 'SUBSCRIPTION' }
            });
            if (!result){
                return false;
            }
            return Operation.fromJson(result.toJSON());
        } catch (error){
            throw error;
        }
    }

    toJson(){
        return{
            code: this.guid,
            reference: this.code,
            name: this.name,
            viewing: this.viewing,
            color: this.color,
            createdAt: this.created.toISOString().split('T')[0],
            time: this.created.toISOString().split('T')[1].split('.')[0]
        }
    }
}

module.exports = {Operation}