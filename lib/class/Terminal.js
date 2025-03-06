const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const TerminalModel = require(path.join(paths.MDL_DIR, 'TerminalModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class Terminal {
    constructor(id = null, guid = null, identified, user = null)
    {
        this.id = id;
        this.guid = guid;
        this.identified = identified;
        this.user = user
    }

    static fromJson(json) {
        return new Terminal(
            json.id, json.guid, json.identified, json.user
        )
    }

    async _duplicate() {
        const existingEntry = await ProfilModel.findOne({
            where: { identified: this.identified }
        });
        await W.isOccur(existingEntry, W.duplicate);
    }

    // async getById() {
    //     const profilId = await ProfilModel.findOne({
    //         where: {
    //             id : this.id
    //         }
    //     });
    //     if(!profilId){
    //         return false;
    //     }
    //     return Profil.fromJson(profilId.toJSON()).toJson();
    // }
    // async getByGuid() {
    //     const profilGuid = await ProfilModel.findOne({
    //         where: {
    //             guid : this.guid
    //         }
    //     });
    //     if(!profilGuid){
    //         return false;
    //     }
    //     return Profil.fromJson(profilGuid.toJSON());
    // }
    //
    // async save() {
    //     try {
    //         await W.isOccur(!ProfilModel, 'ProfilModel is not properly initialized');
    //         let entry;
    //         if (!this.guid){
    //             await this._duplicate();
    //
    //             const db = new Db();
    //             const guid = await db.generateGuid(ProfilModel, 6);
    //             entry = await  ProfilModel.create({
    //                 guid: guid,
    //                 name : this.name,
    //                 description : this.description,
    //             })
    //         }
    //         else {
    //             const existingEntry = await ProfilModel.findOne({
    //                 where: { guid: this.guid }
    //             });
    //             await W.isOccur(!existingEntry, W.errorGuid);
    //
    //             await ProfilModel.update(
    //                 {
    //                     name : this.name,
    //                     description : this.description,
    //                 },
    //                 {
    //                     where: { guid: this.guid }
    //                 });
    //             entry = await ProfilModel.findOne({
    //                 where: { guid: this.guid }
    //             });
    //         }
    //         return Profil.fromJson(entry.toJSON());
    //     } catch (error) {
    //         throw  error;
    //     }
    // }

    toJson(){
        return{
            code : this.guid,
            identified : this.identified,
            user : this.user
        }
    }
}

module.exports = { Terminal };