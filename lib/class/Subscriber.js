const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const SubscriberModel = require(path.join(paths.MDL_DIR, 'SubscriberModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class Subscriber {
    constructor(id = null, guid = null, firstname = null, lastname, mobile = null, country, city = null)
    {
        this.id = id;
        this.guid = guid;
        this.firstname = firstname;
        this.lastname = lastname;
        this.mobile = mobile;
        this.country = country;
        this.city = city;
    }

    static async fromJson(json) {

        return new Subscriber(
            json.id, json.guid, json.firstname, json.lastname, json.mobile, json.country, json.city
        )
    }

    async _duplicate() {
        const existingEntry = await SubscriberModel.findOne({
            where: { mobile: this.mobile }
        });
        // await W.isOccur(existingEntry, W.duplicate);
        if(!existingEntry) return null;
        return existingEntry;
    }

    async save(){
        try {
            await W.isOccur(!SubscriberModel, 'SubscriberModel is not properly initialized');
            let entry;
            if (!this.guid){
                if (this.mobile){
                    const duplicate = await this._duplicate();
                    if (duplicate) {
                        return Subscriber.fromJson(duplicate.toJSON());
                    }
                }

                const db = new Db();
                this.guid = await db.generateGuid(SubscriberModel, 6);
                await  SubscriberModel.create({
                    guid: this.guid,
                    firstname: this.firstname,
                    lastname: this.lastname,
                    mobile: this.mobile,
                    country: this.country,
                    city: this.city
                })
            }
            else {
                const existingEntry = await SubscriberModel.findOne({
                    where: { guid: this.guid }
                });
                await W.isOccur(!existingEntry, W.errorGuid);

                await SubscriberModel.update(
                    {
                        firstname: this.firstname,
                        lastname: this.lastname,
                        mobile: this.mobile,
                        country: this.country,
                        city: this.city
                    },
                    {
                        where: { guid: this.guid }
                    });
            }
            entry = await SubscriberModel.findOne({
                where: { guid: this.guid }
            });
            return Subscriber.fromJson(entry.toJSON());
        }
        catch (error){
            throw error;
        }
    }

    static async getSubscriber(guid){
        try {
            const result = await SubscriberModel.findOne({
                where: {
                    guid: guid
                }
            });
            if (!result){
                return false;
            }
            return Subscriber.fromJson(result.toJSON());
        }
        catch (error){
            throw error;
        }
    }
    static async getSubscriberById(id){
        try {
            const result = await SubscriberModel.findOne({
                where: {
                    id: id
                }
            });
            if (!result){
                return false;
            }
            return (await Subscriber.fromJson(result.toJSON()));
        }
        catch (error){
            throw error;
        }
    }
    static async getSubscriberByContact(mobile){
        try {
            const result = await SubscriberModel.findOne({
                where: {
                    mobile: mobile
                }
            });
            if (!result){
                return null;
            }
            return Subscriber.fromJson(result.toJSON());
        } catch (error){
            throw error;
        }
    }

    toJson(){
        return{
            code: this.guid,
            firstname: this.firstname,
            lastname: this.lastname,
            mobile: this.mobile,
            country: this.country,
            city: this.city
        }
    }
}

module.exports = {Subscriber};