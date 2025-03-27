const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const TransactionModel = require(path.join(paths.MDL_DIR, 'TransactionModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class Transaction{
    constructor(id = null, guid = null, amount, account, isCredited, old_balance, status, subscription, method, mobile, created) {
        this.id = id;
        this.guid = guid;
        this.amount = amount;
        this.account = account;
        this.isCredited = isCredited;
        this.old_balance = old_balance;
        this.status = status;
        this.subscription = subscription;
        this.method = method;
        this.mobile = mobile;
        this.created = created

    }

    static fromJson(json){
        return new Transaction(json.id, json.guid, json.amount, json.account, json.isCredited, json.old_balance, json.status, json.subscription, json.method, json.mobile, json.created)
    }

   async save(){
        try {
            await W.isOccur(!TransactionModel, 'TransactionModel is not properly initialized');
                const db = new Db();
                const guid = await db.generateGuid(TransactionModel, 6);
               const entry = await  TransactionModel.create({
                    guid: guid,
                    amount: this.amount,
                    account: this.account,
                    isCredited: this.isCredited,
                    old_balance: this.old_balance,
                    status: this.status,
                   subscription: this.subscription,
                    method: this.method,
                    mobile: this.mobile
                });
            return Transaction.fromJson(entry.toJSON());
        } catch (error){
            throw error;
        }
   }

   static async updatedStatus(subscription, status){
        try {
            const result = await TransactionModel.update({
                status: status,
            }, {
                where: {
                    subscription: subscription,
                }
            });
            if (!result){
                return false;
            }
                const response = await TransactionModel.findOne({
                where: {subscription: subscription}
            });
            return Transaction.fromJson(response.toJSON());
        }
        catch (error){
            throw error;
        }
   }

    toJson(){
        return{
            code: this.guid,
            amount: this.amount,
            account: this.account,
            isCredited: this.isCredited,
            old_balance: this.old_balance,
            status: this.status,
            subscription: this.subscription,
            method: this.method,
            mobile: this.mobile,
            createdAt: this.created.toISOString().split('T')[0],
            time: this.created.toISOString().split('T')[1].split('.')[0]
        }
    }
}

module.exports = { Transaction }