const express = require('express');
const {Option} = require("../lib/class/Option");
const {Formula} = require("../lib/class/Formula");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");

const router = express.Router();

router.post('/add', async(req, res) => {
    try {
        const {guid, code, name, amount, formulas, description} = req.body;

        if(!code.trim() || !name.trim() || !amount){
            return R.handleError(res, W.errorMissingFields, 400)
        }
        let formulasString = ""; // Initialisation des options
        let formulasArray = [];

        if (formulas) {
            if (Array.isArray(formulas)) {
                formulasArray = formulas;
            } else if (typeof formulas === "string") {
                formulasArray = formulas.split(",");
            } else {
                return R.response(false, "Invalid options format", res, 400);
            }
        }

        // ✅ Vérification que toutes les formulas existent
        let validFormulas = [];
        for (let formulasCode of formulasArray) {
            const formulasResult = await Formula.getFormulaByCode(formulasCode.trim());
            if (!formulasResult) {
                return R.response(false, `Formula "${formulasCode}" not found`, res, 404);
            }
            validFormulas.push(formulasResult.id);
        }

        // ✅ Convertit la liste d'IDs en Json [1,2,3]
        formulasString = validFormulas.join(",");
        const  option = new Option(null, guid, code ,name, amount, formulasString, description, null);
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
router.get('/all', async(req, res) => {
    try {
        const {pin , code} = req.body;
        const response = await Option.getAllFromApi(pin , code);
        if (!response){
            return R.response(false, 'operation_failed', res, 500);
        }
        return R.response(true, response, res, 200);
    } catch (error){
        return R.handleError(res, error.message, 500);
    }
})

module.exports = router;