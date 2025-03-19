const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const PayementModel = require(path.join(paths.MDL_DIR, 'PayementModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class Payement{
    constructor(id = null, guid = null, amount, account, isCredited, old_balance, status, subscription, payement_method, mobile, created) {
        this.id = id;
        this.guid = guid;
        this.amount = amount;
        this.account = account;
        this.isCredited = isCredited;
        this.old_balance = old_balance;
        this.status = status;
        this.subscription = subscription;
        this.payement_method = payement_method;
        this.mobile = mobile;
        this.created = created

    }

    static fromJson(json){
        return new Payement(json.id, json.guid, json.amount, json.account, json.isCredited, json.old_balance, json.status, json.subscription, json.payement_method, json.mobile, json.created)
    }

   async save(){
        try {
            await W.isOccur(!PayementModel, 'PayementModel is not properly initialized');
                const db = new Db();
                const guid = await db.generateGuid(PayementModel, 6);
               const entry = await  PayementModel.create({
                    guid: guid,
                    amount: this.amount,
                    account: this.account,
                    isCredited: this.isCredited,
                    old_balance: this.old_balance,
                    status: this.status,
                   subscription: this.subscription,
                    payement_method: this.payement_method,
                    mobile: this.mobile
                });
            return Payement.fromJson(entry.toJSON());
        } catch (error){
            throw error;
        }
   }

   // static async update(id, status){
   //      try {
   //          const result = await PayementModel.update({
   //              status: status,
   //          }, {
   //              where: {
   //                  id: id,
   //              }
   //          });
   //          if (!result){
   //              return false;
   //          }
   //          return Payement.fromJson(result.toJSON());
   //      }
   //      catch (error){
   //          throw error;
   //      }
   // }

    toJson(){
        return{
            code: this.guid,
            amount: this.amount,
            account: this.account,
            isCredited: this.isCredited,
            old_balance: this.old_balance,
            status: this.status,
            subscription: this.subscription,
            payement_method: this.payement_method,
            mobile: this.mobile,
            createdAt: this.created.toISOString().split('T')[0],
            time: this.created.toISOString().split('T')[1].split('.')[0]
        }
    }
}

module.exports = { Payement }