const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const OptionModel = require(path.join(paths.MDL_DIR, 'OptionModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class  Option {
    constructor(id = null ,guid = null, name, amount, comment = null)
    {
        this.id = id;
        this.guid = guid;
        this.name = name;
        this.amount = amount;
        this.comment = comment;
    }

    static fromJson(json) {
        return new Option(
            json.id , json.guid, json.name, json.amount, json.comment
        )
    }
    async _duplicate() {
        const existingEntry = await OptionModel.findOne({
            where: { name: this.name }
        });
        await W.isOccur(existingEntry, W.duplicate);
    }

    async save() {
        try {
            await W.isOccur(!OptionModel, 'OptionModel is not properly initialized');
            let entry;
            if (!this.guid){
                await this._duplicate();

                const db = new Db();
                const guid = await db.generateGuid(OptionModel, 6);
                entry = await OptionModel.create({
                    guid: guid,
                    name: this.name,
                    amount: this.amount,
                    comment: this.comment,
                })
            }
            else {
                const existingEntry = await OptionModel.findOne({
                    where: { guid: this.guid }
                });
                await W.isOccur(!existingEntry, W.errorGuid);

                await OptionModel.update(
                    {
                        name: this.name,
                        amount: this.amount,
                        comment: this.comment,
                    },
                    {
                        where: { guid: this.guid }
                    });
                entry = await OptionModel.findOne({
                    where: { guid: this.guid }
                });
            }
            return Option.fromJson(entry.toJSON());
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
            amount: this.amount,
            comment: this.comment,
        }
    }
}

module.exports = {Option};