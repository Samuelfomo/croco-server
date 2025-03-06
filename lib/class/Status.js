const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const StatusModel = require(path.join(paths.MDL_DIR, 'StatusModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class  Status {
    constructor(id = null, guid = null, name, color, position)
    {
        this.id = id;
        this.guid = guid;
        this.name = name;
        this.color = color;
        this.position = position;
    }

    static fromJson(json) {
        return new Status(
            json.id , json.guid, json.name, json.color, json.position
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
                    color: this.color,
                    position: this.position,
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
                        color: this.color,
                        position: this.position,
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

    toJson(){
        return{
            code: this.guid,
            name: this.name,
            color: this.color,
            position: this.position,
        }
    }
}

module.exports = {Status};