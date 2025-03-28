const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const FormulaModel = require(path.join(paths.MDL_DIR, 'FormulaModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));
const axios = require("axios");
const {Country} = require("./Country");

class  Formula {
    constructor(id = null, guid = null, code, name, amount, country, description = null, created)
    {
        this.id = id;
        this.guid = guid;
        this.code = code;
        this.name = name;
        this.amount = amount;
        this.country = country;
        this.description = description;
        this.created = created;
    }
    static async fromJson(json) {
        let countryArray = json.country ? json.country: [];

        let validCountry = [];
        for (let countryId of countryArray) {
            const countryResult = await Country.getCountryById(countryId.trim());
            if (countryResult) {
                validCountry.push(countryResult);
            }
        }

        return new Formula(
            json.id, json.guid, json.code, json.name, json.amount, validCountry, json.description, json.created
        );
    }

    /*
     static async fromJson(json) {
        let optionsArray = json.options ? json.options.split(",") : [];

        // 🔹 Récupération des objets Option en base
        let validOptions = [];
        for (let optionGuid of optionsArray) {
            const optionResult = await Option.getOptionById(optionGuid.trim());
            if (optionResult) {
                validOptions.push(optionResult);
            }
        }

        return new Formula(
            json.id, json.guid, json.code, json.name, json.amount, json.comment, validOptions
        );
    }
     */


    async _duplicate() {
        const existingEntry = await FormulaModel.findOne({
            where: { name: this.name }
        });
        await W.isOccur(existingEntry, W.duplicate);
        // if(!existingEntry) return null;
        // return existingEntry;
    }

    async save() {
        try {
            await W.isOccur(!FormulaModel, 'FormulaModel is not properly initialized');
            let entry;
            if (!this.guid){

                await this._duplicate();

                // const duplicate= await this._duplicate();
                // if(duplicate){
                //     return Formula.fromJson(duplicate.toJSON());
                // }

                const db = new Db();
                this.guid = await db.generateGuid(FormulaModel, 6);
                await FormulaModel.create({
                    guid: this.guid,
                    code: this.code,
                    name: this.name,
                    amount: this.amount,
                    country: this.country,
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
                        country: this.country,
                        description: this.description
                    },
                    {
                        where: { guid: this.guid }
                    });
            }
            entry = await FormulaModel.findOne({
                where: { guid: this.guid }
            });
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
            return (await Formula.fromJson(result.toJSON()));
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
            country: this.country,
            comment: this.description,
            createdAt: this.created.toISOString().split('T')[0],
            time: this.created.toISOString().split('T')[1].split('.')[0]
        }
    }
}

module.exports = {Formula};

// const path = require('path');
// const paths = require('../../config/paths');
// const Db = require(path.join(paths.MDL_DIR, 'Db'));
// const FormulaModel = require(path.join(paths.MDL_DIR, 'FormulaModel'));
// const W = require(path.join(paths.TOOL_DIR, 'Watcher'));
// const axios = require("axios");
//
// class  Formula {
//     constructor(id = null, guid = null, code, name, amount, is_option = false, description = null)
//     {
//         this.id = id;
//         this.guid = guid;
//         this.code = code;
//         this.name = name;
//         this.amount = amount;
//         this.is_option = is_option;
//         this.description = description;
//     }
//     static async fromJson(json) {
//         // let optionsArray = json.options ? json.options: [];
//         //
//         // let validOptions = [];
//         // for (let optionGuid of optionsArray) {
//         //     const optionResult = await Option.getOptionById(optionGuid.trim());
//         //     if (optionResult) {
//         //         validOptions.push(optionResult);
//         //     }
//         // }
//
//         return new Formula(
//             json.id, json.guid, json.code, json.name, json.amount, json.is_option, json.description
//         );
//     }
//
//
//     async _duplicate() {
//         const existingEntry = await FormulaModel.findOne({
//             where: { name: this.name }
//         });
//         // await W.isOccur(existingEntry, W.duplicate);
//         if(!existingEntry) return null;
//         return existingEntry;
//     }
//
//     async save() {
//         try {
//             await W.isOccur(!FormulaModel, 'FormulaModel is not properly initialized');
//             let entry;
//             if (!this.guid){
//                 const duplicate= await this._duplicate();
//                 if(duplicate){
//                     return Formula.fromJson(duplicate.toJSON());
//                 }
//
//                 const db = new Db();
//                 this.guid = await db.generateGuid(FormulaModel, 6);
//                 await FormulaModel.create({
//                     guid: this.guid,
//                     code: this.code,
//                     name: this.name,
//                     amount: this.amount,
//                     is_option: this.is_option,
//                     description: this.description
//                 })
//             }
//             else {
//                 const existingEntry = await FormulaModel.findOne({
//                     where: { guid: this.guid }
//                 });
//                 await W.isOccur(!existingEntry, W.errorGuid);
//
//                 await FormulaModel.update(
//                     {
//                         code: this.code,
//                         name: this.name,
//                         amount: this.amount,
//                         is_option: this.is_option,
//                         description: this.description
//                     },
//                     {
//                         where: { guid: this.guid }
//                     });
//             }
//             entry = await FormulaModel.findOne({
//                 where: { guid: this.guid }
//             });
//             return Formula.fromJson(entry.toJSON());
//         }
//         catch (error)
//         {
//             throw error;
//         }
//     }
//
//     static async getAll() {
//         try {
//             const result = await FormulaModel.findAll();
//             return result.map(entry =>(entry));
//         }
//         catch (error)
//         {
//             throw error;
//         }
//     }
//
//     static async getFormulaById(id){
//         try {
//             const result = await FormulaModel.findOne({
//                 where: {
//                     id: id
//                 }
//             });
//             if (!result){
//                 return false;
//             }
//             return (await Formula.fromJson(result.toJSON()));
//         }
//         catch (error){
//             throw error;
//         }
//     }
//
//     static async delete(code) {
//         try {
//             await W.isOccur(!FormulaModel, 'FormulaModel is not properly initialized');
//
//             // Check if entry exists
//             const existingEntry = await FormulaModel.findOne({
//                 where: { code: code }
//             });
//
//             await W.isOccur(!existingEntry, W.errorGuid);
//
//             // Delete the entry
//             return await FormulaModel.destroy({
//                 where: { code: code }
//             });
//
//         } catch (error){
//             throw error;
//         }
//     }
//
//     static async getFormulaByCode(formula){
//         try {
//             const formulaResult = await FormulaModel.findOne({
//                 where: {
//                     code : formula
//                 }
//             });
//             if (!formulaResult){
//                 return false;
//             }
//             return Formula.fromJson(formulaResult.toJSON());
//         }catch (error){
//             throw  error;
//         }
//     }
//     static async getAllFromApi(pin, code){
//         const baseUrl = "https://b.croco-plus.com";
//         const version = "v1.10";
//         const url = `${baseUrl}/${version}`;
//
//         const data = {
//             code: code || 414135,
//             pin: pin || 7190
//         };
//
//         try {
//             const bearer = await axios.post(`${url}/auth/login`, data, {
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 // timeout: 5000,
//                 family: 4
//             });
//             if (!bearer){
//                 throw new Error('bearer token generation error.')
//             }
//             const response = await axios.get(`${url}/formula`,{
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${bearer.data.token}`
//                 }
//                 // timeout: 10000
//             });
//             if (!response){
//                 return null;
//             }
//             return response.data.data;
//         } catch (error) {
//             throw error;
//         }
//     }
//
//
//     toJson(){
//         return{
//             guid: this.guid,
//             code: this.code,
//             name: this.name,
//             // amount: this.amount,
//             is_option: this.is_option,
//             // comment: this.description
//         }
//     }
// }
//
// module.exports = {Formula};