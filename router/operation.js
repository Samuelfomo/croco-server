const express = require('express');
const {Operation} = require("../lib/class/Operation");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");

const router = express.Router();

router.post('/add', async(req, res) => {
    try {
        const {guid, code, name, viewing, color} = req.body;

        if (
            !code || typeof code !== 'string' || !code.trim() ||
            !name || typeof name !== 'string' || !name.trim() ||
            !viewing || typeof viewing !== 'string' || !viewing.trim() ||
            !color || typeof color !== 'string' || !color.trim()
        ) {
            return R.handleError(res, W.errorMissingFields, 400);
        }

        const  operation = new Operation(null, guid, code.toUpperCase(), name, viewing ,color, null);
        const entry = await operation.save();
        if (!entry){
            return  R.response(false, 'error_during_save', res, 500)
        }
        return R.response(true, entry.toJson(), res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
})

module.exports = router;