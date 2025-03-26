const express = require('express');
const {Subscriber} = require("../lib/class/Subscriber");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");
const {Contact} = require("../lib/class/Contact");

const router = express.Router();

router.post('/add', async(req, res) => {
    try {
        const {guid, contact} = req.body;

        if(!contact || !Number(contact)){
            return R.handleError(res, W.errorMissingFields, 400)
        }
        const contactResponse = await Contact.getContactByGuid(contact);
        if (!contactResponse){
            return R.response(false, 'contact_not_found', res, 404);
        }
        const subscriber = new Subscriber(null, guid, contactResponse.id);
        const entry = await subscriber.save();
        return R.response(true, entry.toJson(), res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
})

module.exports = router;