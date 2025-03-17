const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const FormulaModel = require(path.join(paths.MDL_DIR, 'FormulaModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));
const {Option} = require("./Option");

class  Formula {
    constructor(id = null, guid = null, code, name, amount, comment = null, options = null)
    {
        this.id = id;
        this.guid = guid;
        this.code = code;
        this.name = name;
        this.amount = amount;
        this.comment = comment;
        this.options = options;
    }
    static async fromJson(json) {
        let optionData = json.options;
        if (optionData !== null){
            optionData = await Option.getOptionById(json.options)
        }

        return new Formula(
            json.id, json.guid, json.code, json.name, json.amount, json.comment, optionData
        )
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
                    options: this.options,
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
                        options: this.options,
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

    static async getFormula(code){
        try {
            const result = await FormulaModel.findOne({
                where: {
                    code: code
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
            return (await Formula.fromJson(result.toJSON())).toJson();
        }
        catch (error){
            throw error;
        }
    }

    static async delete(code) {
        try {
            await W.isOccur(!FormulaModel, 'FormulaModel is not properly initialized');

            // Check if entry exists
            const existingEntry = await FormulaModel.findOne({
                where: { code: code }
            });

            await W.isOccur(!existingEntry, W.errorGuid);

            // Delete the entry
            return await FormulaModel.destroy({
                where: { code: code }
            });

        } catch (error){
            throw error;
        }
    }

    static async getFormulaByCode(formula){
        try {
            const formulaResult = await FormulaModel.findOne({
                where: {
                    code : formula
                }
            });
            if (!formulaResult){
                return false;
            }
            return Formula.fromJson(formulaResult.toJSON());
        }catch (error){
            throw  error;
        }
    }


    toJson(){
        return{
            guid: this.guid,
            code: this.code,
            name: this.name,
            amount: this.amount,
            comment: this.comment,
            options: this.options? this.options : null,
        }
    }
}

module.exports = {Formula};