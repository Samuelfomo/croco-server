const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const SubscriberModel = require(path.join(paths.MDL_DIR, 'SubscriberModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));
const {Contact} = require("./Contact");

class Subscriber {
    constructor(id = null, guid = null, contact)
    {
        this.id = id;
        this.guid = guid;
        this.contact = contact;
    }

    static async fromJson(json) {
        const contact = await Contact.getContactById(json.contact);
        return new Subscriber(
            json.id, json.guid, contact
        )
    }

    async _duplicate() {
        const existingEntry = await SubscriberModel.findOne({
            where: { contact: this.contact }
        });
        await W.isOccur(existingEntry, W.duplicate);
    }

    async save(){
        try {
            await W.isOccur(!SubscriberModel, 'SubscriberModel is not properly initialized');
            let entry;
            if (!this.guid){
                await this._duplicate();

                const db = new Db();
                const guid = await db.generateGuid(SubscriberModel, 6);
                entry = await  SubscriberModel.create({
                    guid: guid,
                    contact: this.contact
                })
            }
            else {
                const existingEntry = await SubscriberModel.findOne({
                    where: { guid: this.guid }
                });
                await W.isOccur(!existingEntry, W.errorGuid);

                await SubscriberModel.update(
                    {
                        contact: this.contact
                    },
                    {
                        where: { guid: this.guid }
                    });
                entry = await SubscriberModel.findOne({
                    where: { guid: this.guid }
                });
            }
            return Subscriber.fromJson(entry.toJSON());
        }
        catch (error){
            throw error;
        }
    }

    toJson(){
        return{
            code: this.guid,
            contact: this.contact? this.contact : null
        }
    }
}

module.exports = {Subscriber};