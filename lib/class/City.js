const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const CityModel = require(path.join(paths.MDL_DIR, 'CityModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class City {
    constructor(id = null, guid = null, code, name, country){
        this.id = id;
        this.guid = guid;
        this.code = code;
        this.name = name;
        this.country = country
    }

    /**
     * Convert JSON data to City instance
     * @param json
     * @returns {City}
     */
     static  fromJson(json){
        return new City(
            json.id, json.guid, json.code, json.name, json.country
        )
    }

    /**
     * Convert object to JSON
     * @returns {{country, code, name, guid: null}}
     */
    toJson() {
        return {
            guid: this.guid,
            code: this.code,
            name: this.name,
            country: this.country
        }
    }

}

module.exports = {City};