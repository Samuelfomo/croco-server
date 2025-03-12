const express = require('express');
const {City} = require("../lib/class/City");
const R = require("../lib/tool/Reply");
const W = require("../lib/tool/Watcher");
const {Country} = require('../lib/class/Country')
const {User} = require("../lib/class/User");

const router = express.Router();

router.post('/add', async(req, res) => {
    try {
        const {name, country, guid} = req.body;

        if (!name.trim() || !country){
            return R.handleError(res, W.errorMissingFields, 400);
        }

        const countryData = new Country(null, null, null, null, null, country, null)
        const countryResponse = await  countryData.getByGuid();
        if (!countryResponse){
            return R.handleError(res, 'country_not_found', 404)
        }
        console.log("countryResponse :", countryResponse)
        const  city = new City(null, guid, name, countryResponse);
       const entry = await city.save();
        return R.response(true, entry.toJson(), res, 200);

    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
});
router.put('/list',async (req, res) =>{
     const {country} = req.body;
     if(!country){
         return R.handleError(res, W.errorMissingFields, 400);
     }
     const countryData = new Country(null, null, null, null, null, country, null)
     const countryResponse = await countryData.getByGuid();
     if (!countryResponse){
         return  R.response(false, 'country_not_found', res, 404);
     }
     const cityData = await City.getCityById(countryResponse.id);
     if (cityData.length === 0){
         return R.handleError(res, 'country_not_found', 404);
     }
     const result = await Promise.all(cityData.map(async (entry) => (await City.fromJson(entry)).toJson()));
     return R.response(true,  result, res, 200);
 });
router.get('/all',async (req, res) =>{
     const cityData = await City.getCity();
     if (cityData.length === 0){
         return R.handleError(res, 'city_not_found', 404);
     }
     const result = await Promise.all(cityData.map(async (entry) => (await City.fromJson(entry)).toJson()));
     return R.response(true,  result, res, 200);
 });

module.exports = router;