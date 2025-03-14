const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const StatusModel = require(path.join(paths.MDL_DIR, 'StatusModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));
const {Operation} = require("./Operation");

class  Status {
    constructor(id = null, guid = null, name, code, operation, position, color, isPublic = false, description, previousState, nextState, inError, created)
    {
        this.id = id;
        this.guid = guid;
        this.name = name;
        this.code = code;
        this.operation = operation;
        this.position = position;
        this.color = color;
        this.isPublic = isPublic;
        this.description = description;
        this.previousState = previousState;
        this.nextState = nextState;
        this.inError = inError;
        this.created = created
    }

    static async fromJson(json) {
        const operationResult = await Operation.getById(json.operation)
        const result = operationResult.toJson()
        return new Status(
            json.id , json.guid, json.name, json.code, result, json.position, json.color,
            json.isPublic, json.description, json.previousState, json.nextState, json.inError, json.created
        )
    }

    async _duplicate() {
        const existingEntry = await StatusModel.findOne({
            where: { code: this.code, operation : this.operation }
        });
        await W.isOccur(existingEntry, W.duplicate);
    }

    async save() {
        try {
            await W.isOccur(!StatusModel, 'StatusModel is not properly initialized');
            let entry;
            if (!this.guid){
                await this._duplicate();

                const db = new Db();
                const guid = await db.generateGuid(StatusModel, 6);
                entry = await StatusModel.create({
                    guid: guid,
                    name: this.name,
                    code: this.code,
                    operation: this.operation,
                    position: this.position,
                    color: this.color,
                    isPublic: this.isPublic,
                    description: this.description
                })
                if (entry){
                  // const previousStatus = await StatusModel.findOne({
                  //      where: {
                  //          operation: entry.operation,
                  //          position: entry.position -1
                  //      }
                  //   })
                    await StatusModel.update({
                        nextState: entry.id
                    },
                        {
                            where: {
                                operation: entry.operation,
                                position: entry.position -1
                            }
                        })
                }
            }
            else {
                const existingEntry = await StatusModel.findOne({
                    where: { guid: this.guid }
                });
                await W.isOccur(!existingEntry, W.errorGuid);

                await StatusModel.update(
                    {
                        name: this.name,
                        code: this.code,
                        operation: this.operation,
                        position: this.position,
                        color: this.color,
                        isPublic: this.isPublic,
                        description: this.description
                    },
                    { 
                        where: { guid: this.guid }
                    });
                entry = await StatusModel.findOne({
                    where: { guid: this.guid }
                });
            }
            return Status.fromJson(entry.toJSON());
        }
        catch (error)
        {
            throw error;
        }
    }

    static async getAll(){
        try {
            const result = await StatusModel.findAll();
            if (!result.length){
                return [];
            }
            return result.map(entry =>(Status.fromJson(entry.toJSON()).toJson()))
        }
        catch (error){
            throw error;
        }
    }

    toJson(){
        return{
            guid: this.guid,
            name: this.name,
            code: this.code,
            operation: this.operation,
            position: this.position,
            color: this.color,
            isPublic: this.isPublic,
            description: this.description,
            created: this.created.toISOString().split('T')[0],
            time: this.created.toISOString().split('T')[1].split('.')[0],
            previousState: this.previousState,
            nextState: this.nextState,
            inError: this.inError
        }
    }
}

module.exports = {Status};