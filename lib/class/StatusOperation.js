const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const StatusOperationModel = require(path.join(paths.MDL_DIR, 'StatusOperationModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class StatusOperation{
    constructor(id = null, guid = null, status, operation, created) {
        this.id = id;
        this.guid = guid;
        this.status = status;
        this.operation = operation;
        this.created = created
    }

    static fromJson(json){
        return new StatusOperation(
            json.id, json.guid, json.status, json.operation, json.created
        )
    }

    // async _duplicate() {
    //     const existingEntry = await StatusOperationModel.findOne({
    //         where: {
    //             status: this.status,
    //             operation: this.operation
    //         }
    //     });
    //     await W.isOccur(existingEntry, W.duplicate);
    // }

    async save(){
        try {
            await W.isOccur(!StatusOperationModel, 'StatusOperationModel is not properly initialized');
            let entry;
            if (!this.guid){
                // await this._duplicate();

                const db = new Db();
                const guid = await db.generateGuid(StatusOperationModel, 6);
                entry = await  StatusOperationModel.create({
                    guid: guid,
                    status: this.status,
                    operation: this.operation
                })
            }
            else {
                const existingEntry = await StatusOperationModel.findOne({
                    where: { guid: this.guid }
                });
                await W.isOccur(!existingEntry, W.errorGuid);

                await StatusOperationModel.update(
                    {
                        status: this.status,
                        operation: this.operation
                    },
                    {
                        where: { guid: this.guid }
                    });
                entry = await StatusOperationModel.findOne({
                    where: { guid: this.guid }
                });
            }
            return StatusOperation.fromJson(entry.toJSON());
        } catch (error){
            throw error;
        }
    }

    toJson(){
        return{
            code: this.guid,
            status: this.status,
            operation: this.operation,
            createdAt: this.created
        }
    }
}

module.exports = {StatusOperation}