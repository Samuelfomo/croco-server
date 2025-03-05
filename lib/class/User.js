const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const UserModel = require(path.join(paths.MDL_DIR, 'UserModel'));
const {Profil} = require('./Profil');
const {Contact} = require('./Contact');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));


class  User {
    constructor( id = null, guid = null, code, pin, profil, contact, blocked, activated, createdBy = null, deleted, isSecured, lastLogin = null)
    {
        this.id = id;
        this.guid = guid;
        this.code = code;
        this.pin = pin;
        this.profil = profil;
        this.contact = contact;
        this.blocked = blocked;
        this.activated = activated;
        this.createdBy = createdBy;
        this.deleted = deleted;
        this.isSecured = isSecured
        this.lastLogin = lastLogin
    }

    /**
     *
     * @param json
     * @returns {User}
     */
    static async fromJson(json) {

        const profilUser = new Profil(null, null, null, json.profil);
        const profilResponse = await profilUser.getById();

        const contactUser = new Contact(json.contact, null, null, null, null, null, null, null, null, null)
        const contactResponse = await contactUser.getById()

        const userCreated = new User(json.createdBy, null, null, null, null, null, null, null, null, null, null, null);
        const userResponse = await userCreated.getById()

        return new User(
            json.id, json.guid, json.code, json.pin, profilResponse, contactResponse,
            json.blocked, json.activated,userResponse, json.deleted, json.isSecured,
            json.lastLogin
        )
    }

    async _duplicate() {
        const existingEntry = await UserModel.findOne({
            where: { contact: this.contact.id }
        });
        await W.isOccur(existingEntry, W.duplicate);
    }

    async getUserManager(){
        const managerCode = await  UserModel.findOne({
            where: {
                code : this.code
            }
        });
        if (!managerCode){
            return false
        }
        return User.fromJson(managerCode.toJSON());
    }
    async getByGuid(){
        const managerGuid = await  UserModel.findOne({
            where: {
                guid : this.guid
            }
        });
        if (!managerGuid){
            return false
        }
        return User.fromJson(managerGuid.toJSON());
    }
    static async getAllPartner(id){
        try {
            const allPartner = await UserModel.findAll({
                where: {
                    createdBy : id
                }
            });
            if (!allPartner.length){
                return []
            }
            return allPartner.map(entry =>(entry.toJSON()));
        }
        catch (error){
            throw error;
        }
    }
    // static async getAllPartner(guid){
    //     try{
    //         const allPartner = await UserModel.findOne({ where: {guid : guid}});
    //         if (!allPartner.length){
    //             return []
    //         }
    //         // return allPartner.map(entry => User.fromJson(entry.toJSON()) );
    //         return User.fromJson(allPartner.toJSON());
    //     }
    //     catch (error){
    //         throw error;
    //     }
    //
    // }

    async getById(){
        const managerId = await  UserModel.findOne({
            where: {
                id : this.id
            }
        });
        if (!managerId){
            return false
        }
        return User.fromJson(managerId.toJSON());
    }

    static async update(guid) {
        try {
            const existingEntry = await UserModel.findOne({
                where: { guid: guid }
            });
            await W.isOccur(!existingEntry, W.errorGuid);

            await UserModel.update({
                activated: true
            },
                {
                    where: { guid: guid }
                });
            const entry = await UserModel.findOne({
                where: { guid: guid }
            });
            return User.fromJson(entry.toJSON());
        }
        catch (error){
            throw error;
        }

    }
    static async deleted(guid) {
        try {
            const existingEntry = await UserModel.findOne({
                where: { guid: guid }
            });
            await W.isOccur(!existingEntry, W.errorGuid);

            await UserModel.update({
                deleted: true
            },
                {
                    where: { guid: guid }
                });
            const entry = await UserModel.findOne({
                where: { guid: guid }
            });
            return User.fromJson(entry.toJSON());
        }
        catch (error){
            throw error;
        }

    }
    static async blocked(guid) {
        try {
            const existingEntry = await UserModel.findOne({
                where: { guid: guid }
            });
            await W.isOccur(!existingEntry, W.errorGuid);
            const newBlockedValue = !existingEntry.blocked;

            await UserModel.update({
                blocked: newBlockedValue
            },
                {
                    where: { guid: guid }
                });
            const entry = await UserModel.findOne({
                where: { guid: guid }
            });
            return User.fromJson(entry.toJSON());
        }
        catch (error){
            throw error;
        }
    }

    static async verify(code, pin){
        try {
            const result = await UserModel.findOne({
                where: {
                    code: code,
                    pin: pin
                }
            });
            if (!result){
                return false;
            }
            await UserModel.update({
                lastLogin: new Date().toISOString()
                },
                {
                    where:{
                        code: code,
                        pin: pin
                    }
                });
            return User.fromJson(result.toJSON());
        }
        catch (error){
            return error;
        }
    }

    /**
     *
     * @returns {Promise<User>}
     */

    async save(){
        try {
            await W.isOccur(!UserModel, 'UserModel is not properly initialized');
            let entry;
            await this._duplicate();

            const db = new Db();
            const guid = await db.generateGuid(UserModel, 6);
            const code = await db.generateCode(UserModel);
            entry = await UserModel.create({
                guid : guid,
                code: code,
                pin: this.pin,
                profil: this.profil.id,
                contact: this.contact.id,
                blocked: this.blocked,
                activated: this.activated,
                createdBy: this.createdBy.id,
                deleted: this.deleted,
                isSecured: this.isSecured
            });
            return User.fromJson(entry.toJSON());
        }
        catch (error){
            throw  error;
        }
    }

    // async verify(){
    //     const existingUser = await UserModel.findOne({
    //         where: {
    //             code: this.code,
    //             pin : this.pin
    //         },
    //         include: [
    //             { model: ProfilModel, as: 'profil' },
    //             { model: ContactModel, as: 'contact' }
    //         ]
    //     });
    //
    //     if (!existingUser){
    //         return false
    //     }
    //     return User.fromJson(existingUser.toJson());
    // }

    toJson(){
        return{
            guid: this.guid,
            code: this.code,
            pin: this.pin,
            profil: this.profil ? this.profil : null,
            contact: this.contact ? this.contact : null,
            blocked: this.blocked,
            activated: this.activated,
            createdBy: this.createdBy ? this.createdBy : null,
            deleted: this.deleted,
            isSecured: this.isSecured,
            lastLogin: this.lastLogin
        }
    }
}
module.exports = {User};