const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const UserModel = require(path.join(paths.MDL_DIR, 'UserModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class  User {
    constructor(code, pin, profil, contact, guid = null, id = null)
    {
        this.id = id;
        this.guid = guid;
        this.code = code;
        this.pin = pin;
        this.profil = profil;
        this.contact = contact;
    }

    static fromJson(json) {
        return new User(
            json.code, json.pin, json.profil, json.contact, json.guid, json.id
        )
    }

    toJson(){
        return{
            code: this.code,
            pin: this.pin,
            profil: this.profil,
            contact: this.contact,
        }
    }
}