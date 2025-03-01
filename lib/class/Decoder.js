const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const DecoderModel = require(path.join(paths.MDL_DIR, 'DecoderModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class  Decoder {
    constructor(id = null, guid = null, code, device, identifier, location, subscriber, started, finished,
                remaining, formula, updated, existed, verified, forbidden, comment)
    {
        this.id = id;
        this.guid = guid;
        this.code = code;
        this.device = device;
        this.identifier = identifier;
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
    static fromJson(json){
        return new Decoder(
            json.id, json.guid, json.code, json.device, json.identifier, json.location, json.subscriber,
            json.started, json.finished, json.remaining, json.formula, json.updated, json.existed, json.verified,
            json.forbidden, json.comment
        )
    }

    /**
     * Convert object to JSON
     * @returns {{identifier, code, subscriber, forbidden, verified, started, finished, remaining, existed, guid: null, formula, location, comment, device, updated}}
     */
    toJson(){
        return{
            guid: this.guid,
            code: this.code,
            device: this.device,
            identifier: this.identifier,
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