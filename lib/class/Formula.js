const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const FormulaModel = require(path.join(paths.MDL_DIR, 'FormulaModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class  Formula {
    constructor(code, name, amount, comment = null, option = null, guid = null, id = null)
    {
        this.id = id;
        this.guid = guid;
        this.code = code;
        this.name = name;
        this.amount = amount;
        this.comment = comment;
        this.option = option;
    }

    static fromJson(json) {
        return new Formula(
            json.code, json.name, json.amount, json.comment, json.option, json.guid, json.id
        )
    }

    toJson(){
        return{
            guid: this.guid,
            code: this.code,
            name: this.name,
            amount: this.amount,
            comment: this.comment,
            option: this.option,
        }
    }
}