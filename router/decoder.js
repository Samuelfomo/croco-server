const express = require('express');
const {Decoder} = require("../lib/class/Decoder");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");
const V = require("../lib/shared/utils/validation");
const {Contact} = require("../lib/class/Contact");
const {Subscriber} = require("../lib/class/Subscriber");
const {Formula} = require("../lib/class/Formula");

const router = express.Router();

router.post('/add', async(req, res) => {
    try {
        const {guid, device, identified, location, subscriber, started, finished,
            remaining, formula} = req.body;

        if(!Number(device) || !Number(identified) || !location || !subscriber || !started || !finished || !remaining || !formula){
            return R.handleError(res, W.errorMissingFields, 400)
        }
        const subscriberResponse = await Subscriber.getSubscriber(subscriber);
        if (!subscriberResponse){
            return R.response(false, 'subscriber_not_found', res, 404);
        }
        const formulaResponse = await Formula.getFormula(formula);
        if (!formulaResponse){
            return R.response(false, 'formula_not_found', res, 404);
        }
        console.log("formulaResponse is :", formulaResponse)
        console.log("subscriberResponse is :", subscriberResponse)
        const  decoder = new Decoder(null, guid, device, identified, location, subscriberResponse.id, started, finished, remaining, formulaResponse.id, null, null, null, null, null );

        const entry = await decoder.save();
        return R.response(true, entry.toJson(), res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
})
router.put('/search', async(req, res) => {
    try {
        const {device, mobile, identified} = req.body;

        const searchParams = {device, mobile, identified };

        const filteredParams = Object.entries(searchParams).filter(([_, value]) => value);
        if (filteredParams.length !== 1) {
            return R.handleError(res, "provide_exactly_one_search_param", 400);
        }

        const [searchKey, searchValue] = filteredParams[0];
        // Vérification du format en fonction du champ fourni
        if (searchKey === "device" && !V.device(searchValue)) {
            return R.handleError(res, "invalid_device_format", 400);
        }
        if (searchKey === "mobile" && !V.mobile(searchValue)) {
            return R.handleError(res, "invalid_mobile_format", 400);
        }
        if (searchKey === "identified" && !V.identified(searchValue)) {
            return R.handleError(res, "invalid_identified_format", 400);
        }

        let decoderResponse;
        if (searchKey === "mobile"){
            const contactResponse = await Contact.getContactByMobile(searchValue)
            if (!contactResponse){
                return R.response(false, 'contact_not_found', res, 404);
            }
            const subscriberResponse = await Subscriber.getSubscriber(contactResponse.guid);
            if (!subscriberResponse){
                return R.response(false, 'subscriber_not_found', res, 404);
            }
            console.log("subscriberResponse is :", subscriberResponse);
            decoderResponse = await Decoder.search('id', subscriberResponse.id);
        }else {
            decoderResponse = await Decoder.search(searchKey, searchValue);
            if(!decoderResponse){
                return R.response(false, 'decoder_searched_not_found', res, 404);
            }
        }

        return R.response(true, decoderResponse.toJson(), res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
})
router.get('/all', async(req, res) => {
    try {
        const decoderResponse  = await Decoder.getAll();
        if(!decoderResponse){
            return R.response(false, 'decoder_not_found', res, 404);
        }
        const result = await Promise.all(decoderResponse.map(async (entry) => (await (entry)).toJson()));
        return R.response(true, result, res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
})

module.exports = router;