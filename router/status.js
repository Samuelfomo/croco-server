const express = require('express');
const {Status} = require("../lib/class/Status");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");

const router = express.Router();

router.post('/add', async(req, res) => {
    try {
        const {guid, name, color, position} = req.body;

        if(!name || !color || !position){
            return R.handleError(res, W.errorMissingFields, 400)
        }
        const  status = new Status(null, guid, name, color, position);
        const entry = await status.save();
        return R.response(true, entry.toJson(), res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
})

module.exports = router;