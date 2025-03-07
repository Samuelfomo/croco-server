const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const FormulaModel = require(path.join(paths.MDL_DIR, 'FormulaModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class  Formula {
    constructor(id = null, guid = null, name, amount, comment = null, option = null)
    {
        this.id = id;
        this.guid = guid;
        this.name = name;
        this.amount = amount;
        this.comment = comment;
        this.option = option;
    }

    async _duplicate() {
        const existingEntry = await FormulaModel.findOne({
            where: { name: this.name }
        });
        await W.isOccur(existingEntry, W.duplicate);
    }

    async save() {
        try {
            await W.isOccur(!FormulaModel, 'FormulaModel is not properly initialized');
            let entry;
            if (!this.guid){
                await this._duplicate();

                const db = new Db();
                const guid = await db.generateGuid(FormulaModel, 6);
                entry = await FormulaModel.create({
                    guid: guid,
                    name: this.name,
                    amount: this.amount,
                    comment: this.comment,
                    option: this.option,
                })
            }
            else {
                const existingEntry = await FormulaModel.findOne({
                    where: { guid: this.guid }
                });
                await W.isOccur(!existingEntry, W.errorGuid);

                await FormulaModel.update(
                    {
                        name: this.name,
                        amount: this.amount,
                        comment: this.comment,
                        option: this.option,
                    },
                    {
                        where: { guid: this.guid }
                    });
                entry = await FormulaModel.findOne({
                    where: { guid: this.guid }
                });
            }
            return Formula.fromJson(entry.toJSON());
        }
        catch (error)
        {
            throw error;
        }
    }

    static fromJson(json) {
        return new Formula(
            json.id, json.guid, json.name, json.amount, json.comment, json.option
        )
    }

    toJson(){
        return{
            code: this.guid,
            name: this.name,
            amount: this.amount,
            comment: this.comment,
            option: this.option? this.option : null,
        }
    }
}

module.exports = {Formula};