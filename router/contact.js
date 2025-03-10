const express = require('express');
const V = require("../lib/shared/utils/validation")

const {Contact} = require("../lib/class/Contact");
const {City} = require("../lib/class/City");
const R = require("../lib/tool/Reply");
const W = require("../lib/tool/Watcher");

const router = express.Router();

router.post('/add', async(req, res) => {
    try {
        const {guid, firstname, lastname, city, location, language, gender, mobile, email} = req.body;
        if (!lastname || !city|| !language || !gender || !mobile || !email){
          return R.handleError(res, W.errorMissingFields, 400);
        }
        if (!V.email(email)){
            return R.handleError(res, "invalid_email_format", 400);
        }
        if (!V.mobile(mobile)){
            return R.handleError(res, "invalid_mobile_format", 400);
        }

        const cityData = new City(null, city, null, null)
        const cityResponse = await cityData.getByGuid()
        if (!cityResponse){
            return R.handleError(res, 'city_not_found', 404);
        }
        const  contact = new Contact(null, guid, firstname, lastname, location, language, gender, mobile, email, cityResponse);
        const entry = await contact.save();
        return R.response(true, entry.toJson(), res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
        // return R.handleError(res, "internal_server_error", 500);
    }
})

router.use((req, res) => {
    if (req.method === 'GET') {
        return R.handleError(res, `The method ${req.method} on ${req.url} is not defined`, 404);
    }
});

module.exports = router;