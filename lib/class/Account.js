const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const AccountModel = require(path.join(paths.MDL_DIR, 'AccountModel'));
const {User} = require("./User");
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class Account{
    constructor(id = null, guid = null, balance, user, created) {
        this.id = id;
        this.guid = guid;
        this.balance = balance;
        this.user = user;
        this.created = created
    }
    static async fromJson(json){
        const userResponse = await User.getUserById(json.user);
        const userResult = userResponse.toJson();

        return new Account(
            json.id, json.guid, json.balance, userResult, json.created
        )
    }

    async _duplicate() {
        const existingEntry = await AccountModel.findOne({
            where: { user: this.user }
        });
        await W.isOccur(existingEntry, W.duplicate);
    }

    async saved() {
        try {
            await W.isOccur(!AccountModel, 'AccountModel is not properly initialized');
            let entry;
            if(!this.guid){
                await this._duplicate();

                const db = new Db();
                this.guid = await db.generateGuid(AccountModel, 6);
                entry = await  AccountModel.create({
                    guid: this.guid,
                    // balance: this.balance,
                    user: this.user
                });

            } else {
                const existingEntry = await AccountModel.findOne({
                    where: { guid: this.guid }
                });
                await W.isOccur(!existingEntry, W.errorGuid);
                await AccountModel.update(
                    {
                        balance: this.balance
                    },
                    {
                        where: { user : this.user }
                    });
                entry = await AccountModel.findOne({
                    where: { guid: this.guid }
                });
            }
            return Account.fromJson(entry.toJSON());
        } catch (error){
            throw new Error(error);
        }
    }

    static async getAmount(user){
        try {
            const result = await AccountModel.findOne({
                where: { user : user }
            });
            if (!result){
                return false;
            }
            return Account.fromJson(result.toJSON());
        } catch (error){
            throw error;
        }
    }

    static async updateBalance(id, balance){
        try {
             await AccountModel.update({
                balance: balance
            },
                 {where: {id : id}
                 });
            const result = await AccountModel.findOne({
                where: { id : id }
            });
            if (!result){
                return false;
            }
            return Account.fromJson(result.toJSON());
        } catch (error){
            throw error;
        }
    }

    toJson(){
        return{
            code: this.guid,
            balance: this.balance,
            user: this.user,
            createdAt: this.created.toISOString().split('T')[0],
            time: this.created.toISOString().split('T')[1].split('.')[0]
        }
    }
}

module.exports = {Account}