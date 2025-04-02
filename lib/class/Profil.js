const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const ProfilModel = require(path.join(paths.MDL_DIR, 'ProfilModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class Profil {
    constructor(id = null, guid = null, name, reference, description)
    {
        this.id = id;
        this.guid = guid;
        this.name = name;
        this.reference = reference;
        this.description = description;
    }

    static fromJson(json) {
        return new Profil(
            json.id, json.guid, json.name,json.reference, json.description
        )
    }

    async _duplicate() {
        const existingEntry = await ProfilModel.findOne({
            where: { name: this.name }
        });
        await W.isOccur(existingEntry, W.duplicate);
    }

    async save() {
        try {
            await W.isOccur(!ProfilModel, 'ProfilModel is not properly initialized');
            let entry;
            if (!this.guid){
                await this._duplicate();

                const db = new Db();
                const guid = await db.generateGuid(ProfilModel, 6);
                entry = await  ProfilModel.create({
                    guid: guid,
                    name : this.name,
                    reference : this.reference,
                    description : this.description,
                })
            }
            else {
                const existingEntry = await ProfilModel.findOne({
                    where: { guid: this.guid }
                });
                await W.isOccur(!existingEntry, W.errorGuid);

                await ProfilModel.update(
                    {
                        name : this.name,
                        reference : this.reference,
                        description : this.description,
                    },
                    {
                        where: { guid: this.guid }
                    });
                entry = await ProfilModel.findOne({
                    where: { guid: this.guid }
                });
            }
            return Profil.fromJson(entry.toJSON());
        } catch (error) {
            throw  error;
        }
    };

   static async getById(id) {
        const profilId = await ProfilModel.findOne({
            where: {
                id : id
            }
        });
        if(!profilId){
            return false;
        }
        return Profil.fromJson(profilId.toJSON()).toJson();
    }
    static async getByGuid() {
        const profilGuid = await ProfilModel.findOne({
            where: {
                reference : "salePoint"
            }
        });
        if(!profilGuid){
            return false;
        }
        return Profil.fromJson(profilGuid.toJSON());
    }

    static async getAll() {
        try {
            const result = await ProfilModel.findAll();
            if(result.length === 0){
                return [];
            }
            return result.map(entry =>Profil.fromJson(entry.toJSON()).toJson());
        }catch (error){
            throw error;
        }
    }

    toJson(){
        return{
            code : this.guid,
            name : this.name,
            reference : this.reference,
            description : this.description,
        }
    }
}

module.exports = { Profil };