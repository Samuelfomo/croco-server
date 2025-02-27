const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const StatusModel = require(path.join(paths.MDL_DIR, 'StatusModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class  Status {
    constructor(code, name, color, position, guid = null, id = null)
    {
        this.id = id;
        this.guid = guid;
        this.code = code;
        this.name = name;
        this.color = color;
        this.position = position;
    }

    static fromJson(json) {
        return new Status(
            json.code, json.name, json.color, json.position, json.guid, json.id
        )
    }

    toJson(){
        return{
            code: this.code,
            name: this.name,
            color: this.color,
            position: this.position,
            guid: this.guid,
        }
    }
}