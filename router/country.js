const express = require('express');
const {Country} = require("../lib/class/Country");
const R = require("../lib/tool/Reply");
const W = require("../lib/tool/Watcher");

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
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
})

module.exports = router;