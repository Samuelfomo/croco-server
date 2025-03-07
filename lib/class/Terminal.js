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
        const existingEntry = await TerminalModel.findOne({
            where: { identified: this.identified }
        });
        await W.isOccur(existingEntry, W.duplicate);
    }

    async save() {
        try {
            await W.isOccur(!TerminalModel, 'TerminalModel is not properly initialized');
            let entry;
            if (!this.guid){
                await this._duplicate();

                const db = new Db();
                const guid = await db.generateGuid(TerminalModel, 6);
                entry = await TerminalModel.create({
                    guid: guid,
                    identified : this.identified,
                    user : this.user
                })
            }
            else {
                const existingEntry = await TerminalModel.findOne({
                    where: { guid: this.guid }
                });
                await W.isOccur(!existingEntry, W.errorGuid);

                await TerminalModel.update(
                    {
                        identified : this.identified,
                        user : this.user
                    },
                    {
                        where: { guid: this.guid }
                    });
                entry = await TerminalModel.findOne({
                    where: { guid: this.guid }
                });
            }
            return Terminal.fromJson(entry.toJSON());
        } catch (error) {
            throw  error;
        }
    }

    toJson(){
        return{
            code : this.guid,
            identified : this.identified,
            user : this.user ? this.user : null
        }
    }
}

module.exports = { Terminal };