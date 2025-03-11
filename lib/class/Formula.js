const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const FormulaModel = require(path.join(paths.MDL_DIR, 'FormulaModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class  Formula {
    constructor(id = null, guid = null, code, name, amount, comment = null, option = null)
    {
        this.id = id;
        this.guid = guid;
        this.code = code;
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
                    code: this.code,
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
                        code: this.code,
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

    static async getAll() {
        try {
            const result = await FormulaModel.findAll();
            return result.map(entry =>(entry));
        }
        catch (error)
        {
            throw error;
        }
    }

    static async getFormula(guid){
        try {
            const result = await FormulaModel.findOne({
                where: {
                    guid: guid
                }
            });
            if (!result){
                return false;
            }
            return Formula.fromJson(result.toJSON());
        }
        catch (error){
            throw error;
        }
    }
    static async getFormulaById(id){
        try {
            const result = await FormulaModel.findOne({
                where: {
                    id: id
                }
            });
            if (!result){
                return false;
            }
            return Formula.fromJson(result.toJSON()).toJson();
        }
        catch (error){
            throw error;
        }
    }

    static fromJson(json) {
        return new Formula(
            json.id, json.guid, json.code, json.name, json.amount, json.comment, json.option
        )
    }

    toJson(){
        return{
            guid: this.guid,
            code: this.code,
            name: this.name,
            amount: this.amount,
            comment: this.comment,
            option: this.option? this.option : null,
        }
    }
}

module.exports = {Formula};