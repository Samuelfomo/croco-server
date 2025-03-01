const express = require('express');
const path = require('path');
const paths = require('../config/paths');
const {User} = require("../lib/class/User");
const R = require(path.join(paths.TOOL_DIR, 'Reply'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const router = express.Router();

router.put('/login', async(req, res) => {
    try {
        const {code, pin} = req.body;

        if(!code || !code){
            return R.handleError(res, W.errorMissingFields, 400)
        }
        const  user = new  User(code, pin, null, null, null, null);
        const entry = await user.verify()
        return R.response(true, entry.toJson(), res, 200);
    }
    catch (error){
        return R.handleError(res, "internal_server_error", 500);
    }
})

module.exports = router;