const express = require('express');
const {Formula} = require("../lib/class/Formula");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");
const {Country} = require("../lib/class/Country");

const router = express.Router();

router.post("/add", async (req, res) => {
    try {
        const { guid, code, name, amount, country, description} = req.body;

        if (!code.trim() || !name.trim() || !amount) {
            return R.handleError(res, W.errorMissingFields, 400);
        }
        let countryString = "";
        let countryArray = [];

        if (country) {
            if (Array.isArray(country)) {
                countryArray = country;
            } else if (typeof country === "string") {
                countryArray = country.split(",");
            } else {
                return R.response(false, "Invalid options format", res, 400);
            }
        }

        let validCountry = [];
        for (let countryGuid of countryArray) {
            const countryResult = await Country.getCountryByGuid(countryGuid.trim());
            if (!countryResult) {
                return R.response(false, `Country "${countryGuid}" not found`, res, 404);
            }
            validCountry.push(countryResult.id);
        }

        countryString = validCountry.join(",");

        // const countryData = await Country.getCountryByGuid(country);
        // if (!countryData) {
        //     return R.handleError(res, 'country_not_found', 404);
        // }

        const formula = new Formula(null, guid, code, name, amount, countryString, description, null);
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