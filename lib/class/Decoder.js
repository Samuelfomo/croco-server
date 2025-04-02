const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const DecoderModel = require(path.join(paths.MDL_DIR, 'DecoderModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));
const {Subscriber} = require("./Subscriber");
const {Formula} = require("./Formula");
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const axios = require("axios");

class Decoder {
    constructor(id = null, guid = null, canal_id, device, formula, subscriber, finished, description)
    {
        this.id = id;
        this.guid = guid;
        this.canal_id = canal_id;
        this.device = device;
        this.formula = formula;
        this.subscriber = subscriber;
        this.finished = finished;
        this.description = description;
    }

    /**
     * Convert JSON data to Decoder instance
     * @param json
     * @returns {Decoder}
     */
    static async fromJson(json){
        const response = await Subscriber.getSubscriberById(json.subscriber);
        const subscriberResponse = response.toJson();
        const formulaResponse = await Formula.getFormulaById(json.formula);
        const formulaResult = formulaResponse.toJson();
        return new Decoder(
            json.id, json.guid, json.canal_id, json.device, formulaResult, subscriberResponse,
            json.finished, json.description
        )
    }

    async _duplicate() {
        const existingEntry = await DecoderModel.findOne({
            where: { device: this.device }
        });
        await W.isOccur(existingEntry, W.duplicate);
    }

    async save(){
        try {
            await W.isOccur(!DecoderModel, 'DecoderModel is not properly initialized');
            let entry;
            if (!this.guid){
                await this._duplicate();

                const db = new Db();
                this.guid = await db.generateGuid(DecoderModel, 6);
                await  DecoderModel.create({
                    guid: this.guid,
                    canal_id: this.canal_id,
                    device: this.device,
                    formula: this.formula,
                    subscriber: this.subscriber,
                    finished: this.finished,
                    description: this.description
                })
            }
            else {
                const existingEntry = await DecoderModel.findOne({
                    where: { guid: this.guid }
                });
                await W.isOccur(!existingEntry, W.errorGuid);

                await DecoderModel.update(
                    {
                        canal_id: this.canal_id,
                        device: this.device,
                        formula: this.formula,
                        subscriber: this.subscriber,
                        finished: this.finished,
                        description: this.description
                    },
                    {
                        where: { guid: this.guid }
                    });
            }
            entry = await DecoderModel.findOne({
                where: { guid: this.guid }
            });
            return Decoder.fromJson(entry.toJSON());
        }
        catch (error){
            throw error;
        }
    }

    static async search(decoder){
        try {
            const decoderResult = await DecoderModel.findOne({
                where: {
                    device : decoder
                }
            });
            if (!decoderResult){
                return false;
            }
            return Decoder.fromJson(decoderResult.toJSON());
        }
        catch (error){
            throw error;
        }

    }

    // static async search(field, value){
    //     try {
    //         const decoderResult = await DecoderModel.findOne({
    //             where: {
    //                 [field]: value
    //             }
    //         });
    //         if (!decoderResult){
    //             return false;
    //         }
    //         return Decoder.fromJson(decoderResult.toJSON());
    //     }
    //     catch (error){
    //         throw error;
    //     }
    //
    // }

    static async getAll(){
        try {
            const decoderResult = await DecoderModel.findAll();
            if (!decoderResult){
                return false;
            }
            return decoderResult.map(entry =>Decoder.fromJson(entry.toJSON()));
        }
        catch (error){
            throw error;
        }

    }

    static async getByDevice(decoder){
        try {
            const decoderResult = await DecoderModel.findOne({
                where: {
                    device: decoder
                }
            });
            if (!decoderResult){
                return false;
            }
            return Decoder.fromJson(decoderResult.toJSON())
        }catch (error){
            throw error;
        }
    }
    static async getDecoderById(decoder){
        try {
            const decoderResult = await DecoderModel.findOne({
                where: {
                    id: decoder
                }
            });
            if (!decoderResult){
                return false;
            }
            return Decoder.fromJson(decoderResult.toJSON())
        }catch (error){
            throw error;
        }
    }

    static async getApiResponse(decoderNumber , gateway = 1963) {
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
                // family: 4
            });
            if (!bearer){
                throw new Error('bearer token generation error.')
            }
            const response = await axios.get(`${url}/subscriber/${gateway}/search/${decoderNumber}`,{
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${bearer.data.token}`
                }
                // timeout: 10000
            });
            if (!response){
                return null;
            }
            console.log(response);
            return response.data.subscriber;
        } catch (error) {
            throw error;
            // console.error("Erreur lors de la requête :", error.message);
            // throw new Error(error.response?.data?.error || "Erreur lors de l'appel API");
        }
    }

    /**
     * Convert object to JSON
     * @returns {{identified, code: null, subscriber, forbidden, verified, started, finished, remaining, existed, formula, location, comment, device, updated}}
     */
    toJson(){
        return{
            code: this.guid,
            canalId: this.canal_id,
            device: this.device,
            formula: this.formula,
            subscriber: this.subscriber,
            finished: this.finished,
            comment: this.description
        }
    }
}

module.exports = {Decoder};

// static async getApiResponse(decoderNumber){
//    const baseUrl = "https://drive.topupbackup.com"
//      const username = "cee47ec8-4ae7-46dc-b131-dc00eb43d02e";
//     const password = "eG2ZA4Jr#c}y(FED{N8_fS";
//     try {
//         const response = await axios.put(`${baseUrl}/search/decoder/number/`,{
//             decoder : decoderNumber
//         },{
//             headers: {
//                 'Content-Type': 'application/json',
//                     'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
//             }
//         });
//         if (!response){
//             return false
//         }
//         return response.data.response;
//     } catch (error)
//     {
//         throw error;
//     }
// }