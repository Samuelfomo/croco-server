const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const PayementModel = require(path.join(paths.MDL_DIR, 'PayementModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class Payement{
    constructor(id = null, guid = null, amount, account, status, reference, payementMethod, mobile, created) {
        this.id = id;
        this.guid = guid;
        this.amount = amount;
        this.account = account;
        this.status = status;
        this.reference = reference;
        this.payementMethod = payementMethod;
        this.mobile = mobile;
        this.created = created

    }

    static fromJson(json){
        return new Payement(json.id, json.guid, json.amount, json.account, json.status, json.reference, json.payementMethod, json.mobile, json.created)
    }

    toJson(){
        return{
            code: this.guid,
            amount: this.amount,
            account: this.account,
            status: this.status,
            reference: this.reference,
            payementMethod: this.payementMethod,
            mobile: this.mobile,
            createdAt: this.created.toISOString().split('T')[0],
            time: this.created.toISOString().split('T')[1].split('.')[0]
        }
    }
}

module.exports = { Payement }