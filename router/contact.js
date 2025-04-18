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
        if (!lastname.trim() || !city || !language || !gender || !mobile || !email.trim()){
          return R.handleError(res, W.errorMissingFields, 400);
        }


        if (email && !V.email(email)){
            return R.handleError(res, "invalid_email_format", 400);
        }
        if (!V.mobile(mobile)){
            return R.handleError(res, "invalid_mobile_format", 400);
        }

        const cityResponse = await City.getByGuid(city);
        if (!cityResponse){
            return R.handleError(res, 'city_not_found', 404);
        }
        const  contact = new Contact(null, guid, firstname? firstname.trim() : null, lastname, location? location.trim() : null, language, gender, mobile, email.trim(), cityResponse.id, null);
        console.log("new contact is: ",contact);
        const entry = await contact.save();
        return R.response(true, entry.toJson(), res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
        // return R.handleError(res, "internal_server_error", 500);
    }
})
router.put('/check', async(req, res) => {
    try {
        const {mobile} = req.body;
        if (!mobile){
          return R.handleError(res, W.errorMissingFields, 400);
        }
        if (!V.mobile(mobile)){
            return R.handleError(res, "invalid_mobile_format", 400);
        }
        const entry = await Contact.getContactByMobile(mobile);
        if(!entry){
            return R.response(false, 'contact_not_found', res, 404)
        }
        return R.response(true, entry.toJson(), res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
})

router.use((req, res) => {
    if (req.method === 'GET') {
        return R.handleError(res, `The method ${req.method} on ${req.url} is not defined`, 404);
    }
});

module.exports = router;