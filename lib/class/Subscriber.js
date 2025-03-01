const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const SubscriberModel = require(path.join(paths.MDL_DIR, 'SubscriberModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class  Subscriber {
    constructor(contact, guid = null, id = null)
    {
        this.id = id;
        this.guid = guid;
        this.contact = contact;
    }

    static fromJson(json) {
        return new Subscriber(
            json.contact, json.guid, json.id
        )
    }

    toJson(){
        return{
            contact: this.contact,
            guid: this.guid
        }
    }
}

module.exports = {Subscriber};