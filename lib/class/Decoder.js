const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const DecoderModel = require(path.join(paths.MDL_DIR, 'DecoderModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));
const {Subscriber} = require("./Subscriber");
const {Formula} = require("./Formula");
const axios = require("axios");

class  Decoder {
    constructor(id = null, guid = null, device, identified, location, subscriber, started, finished,
                remaining, formula, updated, existed, verified, forbidden, comment)
    {
        this.id = id;
        this.guid = guid;
        this.device = device;
        this.identified = identified;
        this.location = location;
        this.subscriber = subscriber;
        this.started = started;
        this.finished = finished;
        this.remaining = remaining;
        this.formula = formula;
        this.updated = updated;
        this.existed = existed;
        this.verified = verified;
        this.forbidden = forbidden;
        this.comment = comment;

    }

    /**
     * Convert JSON data to Decoder instance
     * @param json
     * @returns {Decoder}
     */
    static async fromJson(json){
        const subscriberResponse = await Subscriber.getSubscriberById(json.subscriber);
        const formulaResponse = await Formula.getFormulaById(json.formula);
        return new Decoder(
            json.id, json.guid, json.device, json.identified, json.location, subscriberResponse,
            json.started, json.finished, json.remaining, formulaResponse, json.updated, json.existed, json.verified,
            json.forbidden, json.comment
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
                const guid = await db.generateGuid(DecoderModel, 6);
                entry = await  DecoderModel.create({
                    guid: guid,
                    device: this.device,
                    identified: this.identified,
                    location: this.location,
                    subscriber: this.subscriber,
                    started: this.started,
                    finished: this.finished,
                    remaining: this.remaining,
                    formula: this.formula,
                    updated: this.updated,
                    existed: this.existed,
                    verified: this.verified,
                    forbidden: this.forbidden,
                    comment: this.comment
                })
            }
            else {
                const existingEntry = await DecoderModel.findOne({
                    where: { guid: this.guid }
                });
                await W.isOccur(!existingEntry, W.errorGuid);

                await DecoderModel.update(
                    {
                        device: this.device,
                        identified: this.identified,
                        location: this.location,
                        subscriber: this.subscriber,
                        started: this.started,
                        finished: this.finished,
                        remaining: this.remaining,
                        formula: this.formula,
                        updated: this.updated,
                        existed: this.existed,
                        verified: this.verified,
                        forbidden: this.forbidden,
                        comment: this.comment
                    },
                    {
                        where: { guid: this.guid }
                    });
                entry = await DecoderModel.findOne({
                    where: { guid: this.guid }
                });
            }
            return Decoder.fromJson(entry.toJSON());
        }
        catch (error){
            throw error;
        }
    }

    static async search(field, value){
        try {
            const decoderResult = await DecoderModel.findOne({
                where: {
                    [field]: value
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

    static async getApiResponse(decoderNumber){
       const baseUrl = "https://drive.topupbackup.com"
         const username = "cee47ec8-4ae7-46dc-b131-dc00eb43d02e";
        const password = "eG2ZA4Jr#c}y(FED{N8_fS";
        try {
            const response = await axios.put(`${baseUrl}/search/decoder/number/`,{
                decoder : decoderNumber
            },{
                headers: {
                    'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
                }
            });
            if (!response){
                return false
            }
            return response.data.response;
        } catch (error)
        {
            throw error;
        }
    }

    /**
     * Convert object to JSON
     * @returns {{identified, code: null, subscriber, forbidden, verified, started, finished, remaining, existed, formula, location, comment, device, updated}}
     */
    toJson(){
        return{
            code: this.guid,
            device: this.device,
            identified: this.identified,
            location: this.location,
            subscriber: this.subscriber,
            started: this.started,
            finished: this.finished,
            remaining: this.remaining,
            formula: this.formula,
            updated: this.updated,
            existed: this.existed,
            verified: this.verified,
            forbidden: this.forbidden,
            comment: this.comment
        }
    }
}

module.exports = {Decoder};

/*
class DecoderSearch {
    constructor() {
        this.baseUrl = config.api.baseURL;
        this.username = config.api.username;
        this.password = config.api.password;
    }

    async search(decoderNumber) {
        try {
            const response = await axios.put(`${this.baseUrl}/search/decoder/number/`, {
                decoder: decoderNumber
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + Buffer.from(`${this.username}:${this.password}`).toString('base64')
                }
            });
            // return new Decoder(response.data);
            // console.log(response);
            return response.data;

        } catch (error) {
            if (error instanceof DecoderErrors) {
                console.error('Decoder search failed:', error);
            }
            return null;
        }
    }
}
 */