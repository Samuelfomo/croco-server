const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const CountryModel = require(path.join(paths.MDL_DIR, 'CountryModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class  Country {
    constructor(code, alpha2, alpha3, dialcode = null, fr = null, en = null, guid = null, id = null) {
        this.id = id;
        this.guid = guid;
        this.code = code;
        this.alpha2 = alpha2;
        this.alpha3 = alpha3;
        this.dialcode = dialcode;
        this.fr = fr;
        this.en = en;
        this.guid = guid;
        this.id = id;
    }

    static fromJson(json) {
        return new Country(
            json.code, json.alpha2, json.alpha3, json.dialcode, json.fr, json.en, json.guid, json.id
        )
    }

    toJson(){
        return{
            guid: this.guid,
            code: this.code,
            alpha2: this.alpha2,
            alpha3: this.alpha3,
            dialcode: this.dialcode,
            fr: this.fr,
            en: this.en,
        }
    }
}