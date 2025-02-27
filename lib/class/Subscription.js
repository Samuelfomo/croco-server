const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const SubscriptionModel = require(path.join(paths.MDL_DIR, 'SubscriptionModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class  Subscription {
    constructor() {
    }

    static fromJson(json) {
        return new Subscription(

        )
    }

    toJson(){
        return{

        }
    }
}