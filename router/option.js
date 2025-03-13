const express = require('express');
const {Option} = require("../lib/class/Option");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");

const router = express.Router();

router.post('/add', async(req, res) => {
    try {
        const {guid, code, name, amount, comment, options} = req.body;

        if(!code.trim() || !name.trim() || !amount){
            return R.handleError(res, W.errorMissingFields, 400)
        }
        const  option = new Option(null, guid, code ,name, amount, comment, options);
        const entry = await option.save();
        if(!entry){
            return R.response(false, 'error_during_save', res, 500);
        }
        return R.response(true, entry.toJson(), res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
})
router.put('/deleted', async(req, res) => {
    try {
        const {code} = req.body;

        if(!code.trim()){
            return R.handleError(res, W.errorMissingFields, 400)
        }
        const deleteOption = await Option.delete(code);
        if (!deleteOption){
            return R.response(false, 'option_deleted_failed', res, 500)
        }
        return R.response(true, 'option_deleted_success', res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
})

module.exports = router;