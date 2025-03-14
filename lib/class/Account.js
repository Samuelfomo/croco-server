const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const AccountModel = require(path.join(paths.MDL_DIR, 'AccountModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));
const {where} = require("sequelize");

class Account{
    constructor(id = null, guid = null, amount, user, created) {
        this.id = id;
        this.guid = guid;
        this.amount = amount;
        this.user = user;
        this.created = created
    }
    static fromJson(json){
        return new Account(
            json.id, json.guid, json.amount, json.user, json.created
        )
    }
    static async getAmount(user, amount){
        try {
            const result = await AccountModel.findOne({
                where: { user : user }
            });
            // await W.isOccur(!result, W.errorGuid);
            if (!result){
                return false;
            }

            if (result.amount < amount){
                // throw new Error("insufficient balance");
                return false;
            }
            const newAmount = result.amount - amount;

            const entry = await AccountModel.update({
                amount: newAmount
            },{
                where: {user: user}
            });
            return Account.fromJson(entry.toJSON());
        } catch (error){
            throw error;
        }
    }

    toJson(){
        return{
            code: this.guid,
            amount: this.amount,
            user: this.user,
            createdAt: this.created.toISOString().split('T')[0],
            time: this.created.toISOString().split('T')[1].split('.')[0]
        }
    }
}

module.exports = {Account}