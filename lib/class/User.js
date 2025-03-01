const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const UserModel = require(path.join(paths.MDL_DIR, 'UserModel'));
const ProfilModel = require(path.join(paths.MDL_DIR, 'ProfilModel'));
const ContactModel = require(path.join(paths.MDL_DIR, 'ContactModel'));
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

    async verify(){
        const existingUser = await UserModel.findOne({
            where: {
                code: this.code,
                pin : this.pin
            },
            include: [
                { model: ProfilModel, as: 'profil' },
                { model: ContactModel, as: 'contact' }
            ]
        });

        if (!existingUser){
            return false
        }
        return User.fromJson(existingUser.toJson());
    }

    toJson(){
        return{
            code: this.code,
            pin: this.pin,
            profil: this.profil ? this.profil.get({ plain: true }) : null,
            contact: this.contact ? this.contact.get({ plain: true }) : null
        }
    }
    async _duplicate() {
        const existingEntry = await UserModel.findOne({
            where: { contact: this.contact }
        });
        await W.isOccur(existingEntry, W.duplicate);
    }
}
module.exports = {User};