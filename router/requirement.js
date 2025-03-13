const express = require('express');
const {Formula} = require("../lib/class/Formula");
const {Option} = require("../lib/class/Option");
const R = require("../lib/tool/Reply");

const router = express.Router();

router.get('', async(req, res) => {
    try {
        const formulaResponse = await Formula.getAll();
        const formulaResult = await Promise.all(formulaResponse.map(async (entry) => (await Formula.fromJson(entry)).toJson()));
        if (!formulaResult){
            return R.response(false, 'empty_formulas', res, 404);
        }
        const optionResponse = await Option.getAll();
        const optionResult = await Promise.all(optionResponse.map(async (entry) => (await Option.fromJson(entry)).toJson()));
        if (!optionResult){
            return R.response(false, 'empty_options', res, 404);
        }
        return R.response(true, {formulas: formulaResult, options: optionResult }, res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
})

module.exports = router;