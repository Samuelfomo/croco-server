const express = require('express');
const {Formula} = require("../lib/class/Formula");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");

const router = express.Router();

router.post('/add', async(req, res) => {
    try {
        const {guid, name, amount, comment, option} = req.body;

        if(!name.trim() || !amount){
            return R.handleError(res, W.errorMissingFields, 400)
        }
        const  formula = new Formula(null, guid, name, amount, comment, option);
        const entry = await formula.save();
        return R.response(true, entry.toJson(), res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
})

module.exports = router;