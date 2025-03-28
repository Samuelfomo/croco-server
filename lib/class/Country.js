const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const CountryModel = require(path.join(paths.MDL_DIR, 'CountryModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class  Country {
    constructor(alpha2, alpha3, dialcode, fr, en, guid = null, id = null) {
        this.id = id;
        this.guid = guid;
        this.alpha2 = alpha2;
        this.alpha3 = alpha3;
        this.dialcode = dialcode;
        this.fr = fr;
        this.en = en;
    }

    static fromJson(json) {
        return new Country(
            json.alpha2, json.alpha3, json.dialcode, json.fr, json.en, json.guid, json.id
        )
    }

    async _duplicate() {
        const existingEntry = await CountryModel.findOne({
            where: {
                alpha2: this.alpha2
            }
        });
        if (existingEntry) {
            return existingEntry;
        }
        return null;

    }

   static async getCountryById(id) {
        const countryId = await CountryModel.findOne({
            where: {
                id: id
            }
        });
        if (!countryId) {
            return null;
        }
        return Country.fromJson(countryId.toJSON());
    }

    static async getCountryByGuid(guid) {
        const countryGuid = await CountryModel.findOne({
            where: {
                guid: guid
            }
        });
        if (!countryGuid){
            return null;
        }
        return Country.fromJson(countryGuid.toJSON());
    }


    async save() {
        try {
            await W.isOccur(!CountryModel, 'CountryModel is not properly initialized');
            let entry;
            if (!this.guid){
             const response = await this._duplicate();
             if (response){
                 return Country.fromJson(response.toJSON())
             }
             /*
             if (response){
                 const cityData = await Country.fromJson(response.toJSON());
                 throw {
                     type: W.duplicate,
                     response: cityData
                 };
             }
              */
                const db = new Db();
                const guid = await db.generateGuid(CountryModel, 6);
                console.log("entry data", entry)
                entry = await CountryModel.create({
                    guid: guid,
                    alpha2: this.alpha2,
                    alpha3: this.alpha3,
                    dialcode: this.dialcode,
                    fr: this.fr,
                    en: this.en,
                })
            }
            else {
                const existingEntry = await CountryModel.findOne({
                    where: { guid: this.guid }
                });
                await W.isOccur(!existingEntry, W.errorGuid);

                await CountryModel.update({
                        alpha2: this.alpha2,
                        alpha3: this.alpha3,
                        dialcode: this.dialcode,
                        fr: this.fr,
                        en: this.en,
                    },
                    {
                        where: { guid: this.guid }
                    });
                entry = await CountryModel.findOne({
                    where: { guid: this.guid }
                });
            }
            console.log("entry response", entry)
            return Country.fromJson(entry.toJSON());
        } catch (error) {
            throw  error;
        }
    }

    static async getAll(){
        try {
            const response = await CountryModel.findAll();
            if(response.length === 0){
                return [];
            }
            return response.map(entry =>(entry.toJSON()));
        }
        catch (error)
        {
            throw error;
        }
    }

    toJson(){
        return{
            code: this.guid,
            alpha2: this.alpha2,
            alpha3: this.alpha3,
            dialcode: this.dialcode,
            fr: this.fr,
            en: this.en,
        }
    }
}

module.exports = { Country };