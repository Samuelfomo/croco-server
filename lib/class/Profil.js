const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const ProfilModel = require(path.join(paths.MDL_DIR, 'ProfilModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class  Profil {
    constructor(code, name, description, guid = null, id = null)
    {
        this.id = id;
        this.guid = guid;
        this.code = code;
        this.name = name;
        this.description = description;
    }

    static fromJson(json) {
        return new Profil(
            json.code, json.name, json.description, json.guid, json.id
        )
    }

    toJson(){
        return{
            code : this.code,
            name : this.name,
            description : this.description,
            guid : this.guid
        }
    }
}