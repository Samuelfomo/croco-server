const express = require('express');
const {Country} = require("../lib/class/Country");
const R = require("../lib/tool/Reply");
const W = require("../lib/tool/Watcher");
const {City} = require("../lib/class/City");

const router = express.Router();

router.post('/add', async(req, res) => {
    try {
        const {alpha2, alpha3, dialcode, fr, en, guid} = req.body;

        if (!alpha2?.trim() || !alpha3?.trim() || !dialcode?.trim() || !fr?.trim() || !en?.trim()){
            return R.handleError(res, W.errorMissingFields, 400);
        }

        const  country = new Country(alpha2, alpha3, dialcode, fr, en, guid, null);
        let entry;
        entry = await country.save();
        return R.response(true, entry.toJson(), res, 200);
        /*
        const  country = new Country(alpha2, alpha3, dialcode, fr, en, guid, null);
        try {
            const entry = await country.save();
            return R.response(true, entry.toJson(), res, 200);
        } catch (error){
            if (error.type === W.duplicate && error.response) {
                // return R.response(false, W.duplicate, error.response, 400)
                // Retourner les données existantes avec le statut d'erreur
                return res.status(400).json({
                    status: false,
                    message: W.duplicate,
                    response: error.response.toJson()
                });
            }
            // Autres erreurs
            return R.handleError(res, error.message, 500);
        }
         */
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
});
router.get('/all',async (req, res) =>{

    const countryData = await Country.getAll();
    if (countryData.length === 0)
    {
        return R.response(false, 'country_not_found', res, 404);
    }
    const result = await Promise.all(countryData.map(async (entry) => (await Country.fromJson(entry)).toJson()));
    return R.response(true,  result, res, 200);
});

module.exports = router;