const express = require('express');
const {Formula} = require("../lib/class/Formula");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");

const router = express.Router();

router.post("/add", async (req, res) => {
    try {
        const { guid, code, name, amount, is_option, includes, extendes, description} = req.body;

        if (!code.trim() || !name.trim() || !amount) {
            return R.handleError(res, W.errorMissingFields, 400);
        }

        let includesArray = [];

        if (includes) {
            if (Array.isArray(includes)) {
                includesArray = includes;
            } else if (typeof includes === "string") {
                includesArray = includes.split(",");
            } else {
                return R.response(false, "Invalid options format", res, 400);
            }
        }

        let validIncludes = [];
        for (let includesCode of includesArray) {
            const includesResult = await Formula.getFormulaByCode(includesCode);
            if (!includesResult) {
                return R.response(false, `Country "${includesCode}" not found`, res, 404);
            }
            validIncludes.push(includesResult.id);
        }

        let extendsArray = [];

        if (extendes) {
            if (Array.isArray(extendes)) {
                extendsArray = extendes;
            } else if (typeof extendes === "string") {
                extendsArray = extendes.split(",");
            } else {
                return R.response(false, "Invalid options format", res, 400);
            }
        }

        let validExtends = [];
        for (let extendsCode of extendsArray) {
            const extendsResult = await Formula.getFormulaByCode(extendsCode.trim());
            if (!extendsResult) {
                return R.response(false, `Country "${extendsCode}" not found`, res, 404);
            }
            validExtends.push(extendsResult.id);
        }

        const formula = new Formula(null, guid, code, name, amount, is_option, validIncludes, validExtends, description, null);
        console.log(formula);
        const entry = await formula.save();
        if (!entry) {
            return R.response(false, "error_during_saving", res, 500);
        }

        return R.response(true, entry.toJson(), res, 200);
    } catch (error) {
        return R.handleError(res, error.message, 500);
    }
});

router.put('/deleted', async(req, res) =>{
    const {code} = req.body;
    if (!code.trim()){
        return R.handleError(res, W.errorMissingFields, 400);
    }
    const deletedFormula = await Formula.delete(code);
    if (!deletedFormula){
        return R.response(false, 'operation_failed', res, 500);
    }
    return R.response(true, 'formula_deleted_success', res, 200);
});
router.get('/all', async(req, res) => {
    const {pin, code} = req.body;
    try {
        const response = await Formula.getAllFromApi(pin, code);
        if (!response){
            return R.response(false, 'operation_failed', res, 500);
        }
        return R.response(true, response, res, 200);
    } catch (error){
        return R.handleError(res, error.message, 500);
    }
})

module.exports = router;