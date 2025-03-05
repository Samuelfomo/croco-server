const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const ProfilModel = require(path.join(paths.MDL_DIR, 'ProfilModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class Profil {
    constructor(name, description, guid = null, id = null)
    {
        this.id = id;
        this.guid = guid;
        this.name = name;
        this.description = description;
    }

    static fromJson(json) {
        return new Profil(
            json.name, json.description, json.guid, json.id
        )
    }

    async _duplicate() {
        const existingEntry = await ProfilModel.findOne({
            where: { name: this.name }
        });
        await W.isOccur(existingEntry, W.duplicate);
    }

    async getById() {
        const profilId = await ProfilModel.findOne({
            where: {
                id : this.id
            }
        });
        if(!profilId){
            return false;
        }
        return Profil.fromJson(profilId.toJSON()).toJson();
    }
    async getByGuid() {
        const profilGuid = await ProfilModel.findOne({
            where: {
                guid : this.guid
            }
        });
        if(!profilGuid){
            return false;
        }
        return Profil.fromJson(profilGuid.toJSON());
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
    }

    toJson(){
        return{
            code : this.guid,
            name : this.name,
            description : this.description,
        }
    }
}

module.exports = { Profil };