const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const OptionModel = require(path.join(paths.MDL_DIR, 'OptionModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));
const axios = require("axios");
const {Formula} = require("./Formula");

class Option {
    constructor(id = null ,guid = null, code,  name, amount, formula, description = null, created)
    {
        this.id = id;
        this.guid = guid;
        this.code = code;
        this.name = name;
        this.amount = amount;
        this.formula = formula;
        this.description = description;
        this.created = created;
    }

    static async fromJson(json) {
        let formulaArray = json.formula ? json.formula: [];

        let validFormula = [];
        for (let formulaId of formulaArray) {
            const formulaResult = await Formula.getFormulaById(formulaId.trim());
            if (formulaResult) {
                validFormula.push(formulaResult);
            }
        }
        // const formulaResponse = await Formula.getFormulaById(json.formula);
        // const formulaResult = formulaResponse.toJson();
        return new Option(
            json.id , json.guid, json.code, json.name, json.amount, validFormula, json.description, json.created
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
                    formula: this.formula,
                    description: this.description
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
                        formula: this.formula,
                        description: this.description,
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
            return Option.fromJson(result.toJSON());
        }catch (error){
            throw error;
        }
    }

    static async getAllFromApi(pin, code){
        const baseUrl = "https://b.croco-plus.com";
        const version = "v1.10";
        const url = `${baseUrl}/${version}`;

        const data = {
            code: code || 414135,
            pin: pin || 7190
        };

        try {
            const bearer = await axios.post(`${url}/auth/login`, data, {
                headers: {
                    "Content-Type": "application/json"
                },
                // timeout: 5000,
                family: 4
            });
            if (!bearer){
                throw new Error('bearer token generation error.')
            }
            const response = await axios.get(`${url}/formula/options`,{
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${bearer.data.token}`
                }
                // timeout: 10000
            });
            if (!response){
                return null;
            }
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }

    toJson(){
        return{
            guid: this.guid,
            code: this.code,
            name: this.name,
            amount: this.amount,
            formula: this.formula? this.formula : null,
            comment: this.description,
            createdAt: this.created.toISOString().split('T')[0],
            time: this.created.toISOString().split('T')[1].split('.')[0]
        }
    }
}

module.exports = {Option};