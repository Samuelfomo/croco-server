const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const OptionModel = require(path.join(paths.MDL_DIR, 'OptionModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));
const axios = require("axios");

class Option {
    constructor(id = null ,guid = null, code,  name, amount, formula, description = null)
    {
        this.id = id;
        this.guid = guid;
        this.code = code;
        this.name = name;
        this.amount = amount;
        this.formula = formula;
        this.description = description;
    }

    static fromJson(json) {
        return new Option(
            json.id , json.guid, json.code, json.name, json.amount, json.formula, json.description
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
            return Option.fromJson(result.toJSON()).toJson();
        }catch (error){
            throw error;
        }
    }

    static async getAllFromApi(){
        const baseUrl = "https://b.croco-plus.com";
        const version = "v1.10";
        const url = `${baseUrl}/${version}`;

        const data = {
            code: 414135,
            pin: 7190
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
        }
    }
}

module.exports = {Option};

/*
const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const FormulaModel = require(path.join(paths.MDL_DIR, 'FormulaModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));
const axios = require("axios");

class  Formula {
    constructor(id = null, guid = null, code, name, amount, description = null)
    {
        this.id = id;
        this.guid = guid;
        this.code = code;
        this.name = name;
        this.amount = amount;
        this.description = description;
    }
    static async fromJson(json) {
        // let optionsArray = json.options ? json.options: [];
        //
        // let validOptions = [];
        // for (let optionGuid of optionsArray) {
        //     const optionResult = await Option.getOptionById(optionGuid.trim());
        //     if (optionResult) {
        //         validOptions.push(optionResult);
        //     }
        // }

        return new Formula(
            json.id, json.guid, json.code, json.name, json.amount, json.description
        );
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
                    description: this.description
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
                        description: this.description
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
    static async getAllFromApi(){
        const baseUrl = "https://b.croco-plus.com";
        const version = "v1.10";
        const url = `${baseUrl}/${version}`;

        const data = {
            code: 414135,
            pin: 7190
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
            const response = await axios.get(`${url}/formula`,{
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
            comment: this.description
        }
    }
}

module.exports = {Formula};
 */