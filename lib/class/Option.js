const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const OptionModel = require(path.join(paths.MDL_DIR, 'OptionModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class  Option {
    constructor(id = null ,guid = null, code,  name, amount, comment = null, options = null)
    {
        this.id = id;
        this.guid = guid;
        this.code = code;
        this.name = name;
        this.amount = amount;
        this.comment = comment;
        this.options = options;
    }

    static fromJson(json) {
        return new Option(
            json.id , json.guid, json.code, json.name, json.amount, json.comment, json.options
        )
    }
    async _duplicate() {
        const existingEntry = await OptionModel.findOne({
            where: { code: this.code }
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
                    code: this.code,
                    name: this.name,
                    amount: this.amount,
                    comment: this.comment,
                    options: this.options,
                })
            }
            else {
                const existingEntry = await OptionModel.findOne({
                    where: { guid: this.guid }
                });
                await W.isOccur(!existingEntry, W.errorGuid);

                await OptionModel.update(
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

    static async getAll() {
        try {
            const result = await OptionModel.findAll();
            return result.map(entry =>(entry));
        }
        catch (error)
        {
            throw error;
        }
    }

    static async delete(code) {
        try {
            await W.isOccur(!OptionModel, 'OptionModel is not properly initialized');

            // Check if entry exists
            const existingEntry = await OptionModel.findOne({
                where: { code: code }
            });

            await W.isOccur(!existingEntry, W.errorGuid);

            // Delete the entry
            return await OptionModel.destroy({
                where: { code: code }
            });

        } catch (error){
            throw error;
        }
    }
    static async getByCode(code){
        try {
            const result = await OptionModel.findOne({
                where: {
                    code: code
                }
            });
            if (!result){
                return false;
            }
            return Option.fromJson(result.toJSON());
        }catch (error){
            throw error;
        }
    }
    static async getOptionById(id){
        try {
            const result = await OptionModel.findOne({
                where: {
                    id: id
                }
            });
            if (!result){
                return null;
            }
            return Option.fromJson(result.toJSON()).toJson();
        }catch (error){
            throw error;
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

module.exports = {Option};