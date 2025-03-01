const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const OptionModel = require(path.join(paths.MDL_DIR, 'OptionModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class  Option {
    constructor(code, name, amount, comment = null, guid = null, id = null)
    {
        this.id = id;
        this.guid = guid;
        this.code = code;
        this.name = name;
        this.amount = amount;
        this.comment = comment;
    }

    static fromJson(json) {
        return new Option(
            json.code, json.name, json.amount, json.comment, json.guid, json.id
        )
    }

    toJson(){
        return{
            guid: this.guid,
            code: this.code,
            name: this.name,
            amount: this.amount,
            comment: this.comment,
        }
    }
}

module.exports = {Option};