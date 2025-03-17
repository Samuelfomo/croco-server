const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const UserModel = require(path.join(paths.MDL_DIR, 'UserModel'));
const {Profil} = require('./Profil');
const {Contact} = require('./Contact');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class  User {
    constructor( id = null, guid = null, name, code, pin, profil, contact, blocked, activated, createdBy = null, deleted, isSecured, lastLogin = null)
    {
        this.id = id;
        this.guid = guid;
        this.name = name;
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

        const profilResponse = await Profil.getById(json.profil);

        const contactResponse = await Contact.getById(json.contact);
        const contactResult = contactResponse.toJson();

        const userResponse = (await User.getById(json.createdBy));

        return new User(
            json.id, json.guid, json.name, json.code, json.pin, profilResponse, contactResult,
            json.blocked, json.activated,userResponse, json.deleted, json.isSecured,
            json.lastLogin
        )
    }

    /**
     *
     * @returns {Promise<void>}
     * @private
     */
    async _duplicate() {
        const existingEntry = await UserModel.findOne({
            where: { contact: this.contact.id }
        });
        await W.isOccur(existingEntry, W.duplicate);
    }

    /**
     *
     * @returns {Promise<User|boolean>}
     */
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

    static async  getDefaultManager(){
        const result = await UserModel.findOne({
            where: {
                isDefault : true
            }
        });
        if(!result){
            return false;
        }
        return User.fromJson(result.toJSON());
    }
    static async  getManager(manager){
        const result = await UserModel.findOne({
            where: {
                guid : manager
            }
        });
        if(!result){
            return false;
        }
        return User.fromJson(result.toJSON());
    }
    static async getUser(user){
        try {
            const result = await UserModel.findOne({
                where: {
                    guid : user
                }
            });
            if(!result){
                return false;
            }
            // return User.fromJson(result.toJSON());
            return result.toJSON();
        } catch (error){
            throw error;
        }

    }

    /**
     *
     * @returns {Promise<User|boolean>}
     */
   static async getByGuid(guid){
        const managerGuid = await  UserModel.findOne({
            where: {
                guid : guid
            }
        });
        if (!managerGuid){
            return false
        }
        return User.fromJson(managerGuid.toJSON());
    }

    /**
     *
     * @param id
     * @returns {Promise<*[]|*[]>}
     */
    static async getAllPartner(id){
        try {
            const allPartner = await UserModel.findAll({
                where: {
                    createdBy : id,
                    deleted: false
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

    /**
     *
     * @returns {Promise<{lastLogin: null, isSecured, code, deleted, blocked, profil: (*|null), createdBy: (*|null), contact: (*|null), name, guid: null, activated}|boolean>}
     */
   static async getById(id){
        const managerId = await  UserModel.findOne({
            where: {
                id : id
            }
        });
        if (!managerId){
            return false
        }
        const result = await User.fromJson(managerId.toJSON());
        return result.toJson();
    }

    /**
     *
     * @param guid
     * @returns {Promise<User>}
     */
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

    /**
     *
     * @param guid
     * @returns {Promise<User>}
     */
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

    /**
     *
     * @param guid
     * @returns {Promise<User>}
     */
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

    /**
     *
     * @param code
     * @param pin
     * @returns {Promise<User|boolean>}
     */
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
            throw error;
        }
    }
    static async createdPin(user, pin){
        try {
            const result = await UserModel.findOne({
                where: {
                    guid: user
                }
            });
            if (!result){
                return false;
            }
            await UserModel.update({
                pin: pin,
                isSecured: true
                },
                {
                    where:{
                        guid: user,
                    }
                });
            return User.fromJson(result.toJSON());
        }
        catch (error){
            throw error;
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
                name: this.name,
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

   static async removed(user) {
        try {
            await W.isOccur(!UserModel, 'UserModel is not properly initialized');

            // Check if entry exists
            const existingEntry = await UserModel.findOne({
                where: { guid: user }
            });

            await W.isOccur(!existingEntry, W.errorGuid);

            // Delete the entry
            return await UserModel.destroy({
                where: { guid: user }
            });

        } catch (error) {
            throw error;
        }
    }

    static async getByMobile(contact) {
        try {
            const response = await UserModel.findOne({
                where: { contact : contact}
            });
            if (!response){
                return false;
            }
            return User.fromJson(response.toJSON());
        } catch (error){
            throw error;
        }
    }

    /**
     *
     * @returns {{lastLogin: null, isSecured, code, deleted, blocked, profil: (*|null), createdBy: (*|null), contact: (*|null), name, guid: null, activated}}
     */
    toJson(){
        return{
            guid: this.guid,
            name: this.name,
            code: this.code,
            // pin: this.pin,
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