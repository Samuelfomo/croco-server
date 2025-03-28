const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const CityModel = require(path.join(paths.MDL_DIR, 'CityModel'));
const {Country} = require('./Country')
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class City {
    constructor(id = null, guid = null, name, country){
        this.id = id;
        this.guid = guid;
        this.name = name;
        this.country = country
    }

    /**
     * Convert JSON data to City instance
     * @param json
     * @returns {City}
     */
     static async  fromJson(json){

        const countryResponse = await Country.getCountryById(json.country);
        const countryResult = countryResponse.toJson();
        return new City(
            json.id, json.guid, json.name, countryResult
        )
    }

    async _duplicate() {
        const existingEntry = await CityModel.findOne({
            where: {
                name: this.name,
                country: this.country.id
            }
        });
        // await W.isOccur(existingEntry, W.duplicate);
        if (existingEntry){
            return existingEntry;
        }
        return null;
    }

    async getById() {
        const cityId = await CityModel.findOne({
            where: {
                id: this.id
            }
        });
        if (!cityId){
            return false
        }
        return City.fromJson(cityId.toJSON());
    }

    async getByGuid() {
        const cityGuid = await CityModel.findOne({
            where: {
                guid: this.guid
            }
        });
        if (!cityGuid){
            return false
        }
        return City.fromJson(cityGuid.toJSON());
    }

     static async getCity() {
         try{
             const result =  await CityModel.findAll();
             return result.map(entry =>entry.toJSON());
         }catch (error){
             throw error;
         }
     }


    async save() {
        try {
            await W.isOccur(!CityModel, 'CityModel is not properly initialized');
            let entry;
            if (!this.guid){
               const existingData = await this._duplicate();

               if (existingData){
                   return City.fromJson(existingData.toJSON());
               }

                const db = new Db();
                const guid = await db.generateGuid(CityModel, 6);
                entry = await  CityModel.create({
                    guid: guid,
                    name: this.name,
                    country: this.country.id
                })
            }
            else {
                const existingEntry = await CityModel.findOne({
                    where: { guid: this.guid }
                });
                await W.isOccur(!existingEntry, W.errorGuid);

                await CityModel.update({
                        name: this.name,
                        country: this.country.id
                    },
                    {
                        where: { guid: this.guid }
                    });
                entry = await CityModel.findOne({
                    where: { guid: this.guid },
                });
            }
            console.log("City.fromJson(entry.toJSON()) save is:", City.fromJson(entry.toJSON()))
            return City.fromJson(entry.toJSON());
        } catch (error) {
            throw  error;
        }
    }

    static async getCityById(id){
         try {
             console.log(id)
             const cityResult = await CityModel.findAll({
                 where: {
                     country : id
                 }
             });
             if (!cityResult.length){
                 return []
             }
             return cityResult.map(entry =>(entry.toJSON()));

         }
         catch (error){
             throw  error;
         }
    }

    /**
     * Convert object to JSON
     * @returns {{country, code: null, name}}
     */
    toJson() {
        return {
            code: this.guid,
            name: this.name,
            country: this.country ? this.country: null
        }
    }

}

module.exports = {City};