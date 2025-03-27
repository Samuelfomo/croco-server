const express = require('express');
const {Formula} = require("../lib/class/Formula");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");

const router = express.Router();

router.post("/add", async (req, res) => {
    try {
        const { guid, code, name, amount, description} = req.body;

        if (!code.trim() || !name.trim() || !amount) {
            return R.handleError(res, W.errorMissingFields, 400);
        }

        const formula = new Formula(null, guid, code, name, amount, description);
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
    try {
        const response = await Formula.getAllFromApi();
        if (!response){
            return R.response(false, 'operation_failed', res, 500);
        }
        return R.response(true, response, res, 200);
    } catch (error){
        return R.handleError(res, error.message, 500);
    }
})

module.exports = router;