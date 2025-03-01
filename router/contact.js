const express = require('express');
const V = require("../lib/shared/utils/validation")

const {Contact} = require("../lib/class/Contact");
const R = require("../lib/tool/Reply");
const W = require("../lib/tool/Watcher");

const router = express.Router();

router.post('/add', async(req, res) => {
    try {
        const {firstname, lastname, city, location, language, gender, mobile, email, guid} = req.body;
        if (!lastname.trim() || !city.trim() || !language.trim() || !gender.trim() || !mobile.trim() || !email.trim()){
          return R.handleError(res, W.errorMissingFields, 400);
        }
        if (!V.email(email)){
            return R.handleError(res, "invalid_email_format", 400);
        }
        if (!V.mobile(mobile)){
            return R.handleError(res, "invalid_mobile_format", 400);
        }

        const  contact = new Contact(firstname, lastname, city, location, language, gender, mobile, email, null, guid);
        const entry = await contact.save();
        return R.response(true, entry.toJson(), res, 200);

        // return  R.handleResponse(res, "email_validation_successfully", 200);
        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // if (email && !emailRegex.test(email)) {
        //     return R.handleError(res, "invalid_email_format", 400);
        // }
    }
    catch (error){
        return R.handleError(res, "internal_server_error", 500);
    }
})

router.use((req, res) => {
    if (req.method === 'GET') {
        return R.handleError(res, `The method ${req.method} on ${req.url} is not defined`, 404);
    }
});

module.exports = router;