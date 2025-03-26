const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const ContactModel = require(path.join(paths.MDL_DIR, 'ContactModel'));
const {City} = require('./City');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class Contact {
    constructor( id = null, guid = null, firstname = null, lastname, location = null, language, gender, mobile, email, city) {
        this.id = id;
        this.guid = guid;
        this.firstname = firstname;
        this.lastname = lastname;
        this.location = location;
        this.language = language;
        this.gender = gender;
        this.mobile = mobile;
        this.email = email;
        this.city = city
    }

    /**
     * Convert JSON data to Contact instance
     * @param json
     * @returns {Contact}
     */
    static async fromJson(json) {
        const cityData = new City(json.city, null, null, null)
        const cityResponse = await cityData.getById()
        const cityResult = cityResponse.toJson();
        return new Contact(
            json.id , json.guid, json.firstname, json.lastname, json.location,
            json.language, json.gender, json.mobile, json.email, cityResult
        );
    }

    async _duplicate() {
        const existingEntry = await ContactModel.findOne({
            where: { mobile: this.mobile }
        });
        await W.isOccur(existingEntry, W.duplicate);
    }

    async save() {
        try {
            await W.isOccur(!ContactModel, 'ContactModel is not properly initialized');
            let entry;
            if (!this.guid){
                await this._duplicate();

                const db = new Db();
                const guid = await db.generateGuid(ContactModel, 6);
                entry = await ContactModel.create({
                    guid: guid,
                    firstname: this.firstname,
                    lastname: this.lastname,
                    city: this.city.id,
                    location: this.location,
                    language: this.language,
                    gender: this.gender === 'm' ?1 : 0,
                    mobile: this.mobile,
                    email: this.email
                })
            }
            else {
                const existingEntry = await ContactModel.findOne({
                    where: { guid: this.guid }
                });
                await W.isOccur(!existingEntry, W.errorGuid);

                await ContactModel.update({
                    firstname: this.firstname,
                    lastname: this.lastname,
                    city: this.city.id,
                    location: this.location,
                    language: this.language,
                    gender: this.gender === 'm' ?1 : 0,
                    mobile: this.mobile,
                    email: this.email
                },
                    {
                        where: { guid: this.guid }
                    });
                entry = await ContactModel.findOne({
                    where: { guid: this.guid }
                });
            }
            return Contact.fromJson(entry.toJSON());
        } catch (error) {
            throw  error;
        }
    }

    static async getContactById(id){
        try {
            const result = await ContactModel.findOne({
                where: {
                    id : id
                }
            });
            if (!result)
            {
                return false;
            }
            return Contact.fromJson(result.toJSON());
        }
        catch (error){
            throw error;
        }
    }
    static async getContactByGuid(guid){
        const contactGuid = await ContactModel.findOne({
            where: {
                guid : guid
            }
        });
        if (!contactGuid){
            return false;
        }
        return Contact.fromJson(contactGuid.toJSON());
    }
    static async getContactByMobile(mobile){
        try {
            const result = await ContactModel.findOne({
                where: {
                    mobile : mobile
                }
            });
            if (!result)
            {
                return false;
            }
            return Contact.fromJson(result.toJSON());
        }
        catch (error){
            throw error;
        }
    }

    /**
     * Convert object to JSON
     * @returns {{firstname: null, code: null, gender, city: (*|null), mobile, location: null, language, email, lastname}}
     */
    toJson() {
        return {
            code: this.guid,
            firstname: this.firstname,
            lastname: this.lastname,
            location: this.location,
            language: this.language,
            gender: this.gender,
            mobile: this.mobile,
            email: this.email,
            city: this.city? this.city: null
        };
    }

}


module.exports = {Contact};
