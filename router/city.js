const express = require('express');
const {City} = require("../lib/class/City");
const R = require("../lib/tool/Reply");
const W = require("../lib/tool/Watcher");
const {Country} = require('../lib/class/Country')

const router = express.Router();

router.post('/add', async(req, res) => {
    try {
        const {name, country, guid} = req.body;

        if (!name?.trim() || !country){
            return R.handleError(res, W.errorMissingFields, 400);
        }

        const countryData = new Country(null, null, null, null, null, country, null)
        const countryResponse = await  countryData.getByGuid();
        if (!countryResponse){
            return R.handleError(res, 'country_not_found', 404)
        }
        const  city = new City(null, guid, name, countryResponse);
       const entry = await city.save();
        return R.response(true, entry.toJson(), res, 200);

    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
})

module.exports = router;