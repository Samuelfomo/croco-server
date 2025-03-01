const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const CityModel = require(path.join(paths.MDL_DIR, 'CityModel'));
const CountryModel = require(path.join(paths.MDL_DIR, 'CountryModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class City {
    constructor(name, country, guid = null, id = null){
        this.id = id;
        this.guid = guid;
        this.name = name;
        this.country = country;
    }

    /**
     * Convert JSON data to City instance
     * @param json
     * @returns {City}
     */
    static fromJson(json){
        return new City(
            json.name, json.country, json.guid, json.id
        );
    }

    async _duplicate() {
        const existingEntry = await CityModel.findOne({
            where: {
                name: this.name,
            }
        });
        await W.isOccur(existingEntry, W.duplicate);
    }

    async save() {
        try {
            await W.isOccur(!CityModel, 'CityModel is not properly initialized');
            let entry;

            if (!this.guid) {
                await this._duplicate();

                const db = new Db();
                const guid = await db.generateGuid(CityModel, 6);

                // Stocker le guid généré dans l'instance
                this.guid = guid;

                // S'assurer que country est l'ID et non l'objet entier
                const countryId = typeof this.country === 'object' ? this.country.id : this.country;

                await CityModel.create({
                    guid: guid,
                    name: this.name,
                    country: countryId
                });
            }
            else {
                const existingEntry = await CityModel.findOne({
                    where: { guid: this.guid }
                });
                await W.isOccur(!existingEntry, W.errorGuid);

                // S'assurer que country est l'ID et non l'objet entier
                const countryId = typeof this.country === 'object' ? this.country.id : this.country;

                await CityModel.update({
                        name: this.name,
                        country: countryId
                    },
                    {
                        where: { guid: this.guid }
                    });
            }

            // Récupérer l'entrée avec les données du pays
            entry = await CityModel.findOne({
                where: { guid: this.guid },
                include: [{ model: CountryModel, as: 'country' }]
            });

            if (!entry) {
                throw new Error('City not found after save');
            }

            return {
                success: true,
                user: this.formatResponse(entry.toJSON())
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Format the response according to the specified structure
     * @param {Object} data - The data from database
     * @returns {Object} - Formatted response
     */
    formatResponse(data) {
        return {
            code: data.guid.toString(),
            name: data.name,
            country: data.country ? {
                id: data.country.id,
                code: data.country.guid.toString(),
                alpha2: data.country.alpha2
            } : null
        };
    }

    /**
     * Convert object to JSON (for compatibility with existing code)
     * @returns {{country, code, name}}
     */
    toJson() {
        return {
            code: this.guid,
            name: this.name,
            country: this.country ? (typeof this.country.toJson === 'function' ? this.country.toJson() : this.country) : null
        };
    }
}

module.exports = {City};

// const path = require('path');
// const paths = require('../../config/paths');
// const Db = require(path.join(paths.MDL_DIR, 'Db'));
// const CityModel = require(path.join(paths.MDL_DIR, 'CityModel'));
// const CountryModel = require(path.join(paths.MDL_DIR, 'CountryModel'));
// const W = require(path.join(paths.TOOL_DIR, 'Watcher'));
//
// class City {
//     constructor(name, country, guid = null, id = null){
//         this.id = id;
//         this.guid = guid;
//         this.name = name;
//         this.country = country
//     }
//
//     /**
//      * Convert JSON data to City instance
//      * @param json
//      * @returns {City}
//      */
//      static  fromJson(json){
//         return new City(
//           json.name, json.country, json.guid, json.id
//         )
//     }
//
//     async _duplicate() {
//         const existingEntry = await CityModel.findOne({
//             where: {
//                 name: this.name,
//             }
//         });
//         await W.isOccur(existingEntry, W.duplicate);
//     }
//
//
//     async save() {
//         try {
//             await W.isOccur(!CityModel, 'CityModel is not properly initialized');
//             let entry;
//             if (!this.guid){
//                 await this._duplicate();
//
//                 const db = new Db();
//                 const guid = await db.generateGuid(CityModel, 6);
//                 entry = await  CityModel.create({
//                     guid: guid,
//                     name: this.name,
//                     country: this.country
//                 })
//             }
//             else {
//                 const existingEntry = await CityModel.findOne({
//                     where: { guid: this.guid }
//                 });
//                 await W.isOccur(!existingEntry, W.errorGuid);
//
//                 await CityModel.update({
//                         name: this.name,
//                         country: this.country
//                     },
//                     {
//                         where: { guid: this.guid }
//                     });
//                 entry = await CityModel.findOne({
//                     where: { guid: this.guid },
//                     include: [{ model: CountryModel }]
//                 });
//             }
//             return City.fromJson(entry.toJSON());
//         } catch (error) {
//             throw  error;
//         }
//     }
//
//     /**
//      * Convert object to JSON
//      * @returns {{country, code, name, guid: null}}
//      */
//     toJson() {
//         return {
//             code: this.guid,
//             name: this.name,
//             country: this.country ? this.country.toJson() : null
//         }
//     }
//
// }
//
// module.exports = {City};