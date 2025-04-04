const express = require('express');
const {Formula} = require("../lib/class/Formula");
const {Option} = require("../lib/class/Option");
const R = require("../lib/tool/Reply");

const router = express.Router();

router.get('/api', async(req, res) => {
    try {
            const {pin, code} = req.body;
         const formulaResponse = await Formula.getAllFromApi(pin, code);

        if (!formulaResponse){
            return R.response(false, 'empty_formulas', res, 404);
        }

        const optionResponse = await Option.getAllFromApi(pin, code);
        if(!optionResponse){
            return R.response(false, 'empty_options', res, 404);
        }

        // // Enregistrer les formules
        // const formulaResults = [];
        // for (const formula of formulaResponse) {
        //     const data = (await Formula.fromJson(formula)).toJson();
        //     const formulaInstance = new Formula(null, data.guid, data.code, data.name, null, data.is_option, null);
        //     const result = await formulaInstance.save();
        //     formulaResults.push(result.toJson());
        // }

        // Enregistrer les options
        // const optionResults = [];
        // for (const option of optionResponse) {
        //     const data = (await Formula.fromJson(option)).toJson();
        //     const optionInstance = new Formula(null, data.guid, data.code, data.name, null, data.is_option, null);
        //     const result = await optionInstance.save();
        //     optionResults.push(result.toJson());
        // }
        //
        // // Vérifier si l'enregistrement a réussi
        // if (formulaResults.length === 0 || optionResults.length === 0) {
        //     return R.response(false, 'error_during_saved_formula', res, 404);
        // }

        return R.response(true,{formulas: formulaResponse, options: optionResponse } , res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
});

router.get('', async(req, res) => {
    try {
        const formulaResponse = await Formula.getAll();
        const formulaResult = await Promise.all(formulaResponse.map(async (entry) => (await Formula.fromJson(entry)).toJson()));
        if (!formulaResult){
            return R.response(false, 'empty_formulas', res, 404);
        }
        // const optionResponse = await Option.getAll();
        // const optionResult = await Promise.all(optionResponse.map(async (entry) => (await Option.fromJson(entry)).toJson()));
        // if (!optionResult){
        //     return R.response(false, 'empty_options', res, 404);
        // }
        return R.response(true, formulaResult , res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
})

module.exports = router;