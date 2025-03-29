const path = require('path');
const paths = require('../../config/paths');
// const Db = require(path.join(paths.MDL_DIR, 'Db'));
const AccountModel = require(path.join(paths.MDL_DIR, 'AccountModel'));
const {User} = require("./User");
// const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

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
        console.log(userResponse);
        const userResult = userResponse.toJson();

        return new Account(
            json.id, json.guid, json.balance, userResult, json.created
        )
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
            const result = await AccountModel.update({
                balance: balance
            }, {where: {id : id}});
            if (!result){
                return false;
            }
            return result;
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