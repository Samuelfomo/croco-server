const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const StatusModel = require(path.join(paths.MDL_DIR, 'StatusModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class  Status {
    constructor(id = null, guid = null, name, code, refferal, color, isPublic = false, description)
    {
        this.id = id;
        this.guid = guid;
        this.name = name;
        this.code = code;
        this.refferal = refferal;
        this.color = color;
        this.isPublic = isPublic;
        this.description = description;
    }

    static fromJson(json) {
        return new Status(
            json.id , json.guid, json.name, json.code, json.refferal, json.color, json.isPublic, json.description
        )
    }

    async _duplicate() {
        const existingEntry = await StatusModel.findOne({
            where: { name: this.name }
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
                    refferal: this.refferal,
                    color: this.color,
                    isPublic: this.isPublic,
                    description: this.description
                })
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
                        refferal: this.refferal,
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
            refferal: this.refferal,
            color: this.color,
            isPublic: this.isPublic,
            description: this.description
        }
    }
}

module.exports = {Status};