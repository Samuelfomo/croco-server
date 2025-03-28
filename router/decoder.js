const express = require('express');
const {Decoder} = require("../lib/class/Decoder");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");
const V = require("../lib/shared/utils/validation");
const {Formula} = require("../lib/class/Formula");
const {Subscriber} = require("../lib/class/Subscriber");

const router = express.Router();

// router.post('/add', async(req, res) => {
//     try {
//         const {guid, device, identified, location, subscriber, finished,
//             remaining, formula} = req.body;
//
//         if(!Number(device) || !Number(identified) || !location || !subscriber || !V.date(finished) || !formula){
//             return R.handleError(res, W.errorMissingFields, 400)
//         }
//         const contactData = await Contact.getContactByGuid(subscriber);
//         if(!contactData){
//             return R.handleError(res, "subscriber_not_found", 400)
//         }
//
//         // const subscriberResponse = await Subscriber.getSubscriberByContactId(contactData.id);
//
//         const formulaResponse = await Formula.getFormulaByCode(formula);
//         if (!formulaResponse){
//             return R.response(false, 'formula_not_found', res, 404);
//         }
//
//         const started = V.getStartDate(finished)
//
//         const  decoder = new Decoder(null, guid, device, identified, location, contactData.id, started, finished, remaining, formulaResponse.id, null, null, null, null, null );
//
//         const entry = await decoder.save();
//         return R.response(true, entry.toJson(), res, 200);
//     }
//     catch (error){
//         return R.handleError(res, error.message, 500);
//     }
// });

router.put('/search', async(req, res) => {
    try {
        const {device, gateway} = req.body;

        if (!V.device(device)) {
            return R.handleError(res, W.errorMissingFields, 400)
        }

        let decoderResponse;
        decoderResponse = await Decoder.search(device);
        if(!decoderResponse){
            // const gateway = 1963;
            const decoderApiResponse = await Decoder.getApiResponse(device, gateway);
            if (!decoderApiResponse){
                return R.response(false, 'decoder_searched_not_found', res, 404);
            }
            let subscriberId;

            if (decoderApiResponse.mobile) {
               const subscriberResponse = await Subscriber.getSubscriberByContact(decoderApiResponse.mobile);
                console.log("subscriberResponse noejejjke; ", subscriberResponse);

               if (!subscriberResponse){
                   console.log("I'm here now")
                   const subscriberData = new Subscriber(null, null, decoderApiResponse.firstname, decoderApiResponse.lastname, decoderApiResponse.mobile, decoderApiResponse.country, decoderApiResponse.city);
                   const subscriberSaved = await subscriberData.save();
                   if (!subscriberSaved){
                       return R.response(false, 'error_during_subscriber_save', res, 500);
                   }
                   subscriberId = subscriberSaved.id;
               }
               else {
                   subscriberId = subscriberResponse.id;
               }
            }
            else {
                const subscriberData1 = new Subscriber(null, null, decoderApiResponse.firstname, decoderApiResponse.lastname, null, decoderApiResponse.country, decoderApiResponse.city);
                const subscriberSaved1 = await subscriberData1.save();
                if (!subscriberSaved1){
                    return R.response(false, 'error_during_subscriber_save', res, 500);
                }
                subscriberId = subscriberSaved1.id;
            }
            const formulaResponse = await Formula.getFormulaByCode(decoderApiResponse.formula);
            if (!formulaResponse){
                return R.response(false, 'formula_not_found', res, 500);
            }
            console.log("decoderApiResponse.expiry is:", decoderApiResponse.expiry);
            const decoderData = new Decoder(null, null, decoderApiResponse.canal_id, decoderApiResponse.decoder, formulaResponse.id, subscriberId, decoderApiResponse.expiry, null);
            const decoderSaved = await decoderData.save();
            if (!decoderSaved){
                return R.response(false, 'error_during_decoder_save', res, 500);
            }
            return R.response(false, decoderSaved.toJson(), res, 200, true);
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
// router.put('/search', async(req, res) => {
//     try {
//         const {device, mobile, identified} = req.body;
//
//         const searchParams = {device, mobile, identified };
//
//         const filteredParams = Object.entries(searchParams).filter(([_, value]) => value);
//         if (filteredParams.length !== 1) {
//             return R.handleError(res, "provide_exactly_one_search_param", 400);
//         }
//
//         const [searchKey, searchValue] = filteredParams[0];
//         // Vérification du format en fonction du champ fourni
//         if (searchKey === "device" && !V.device(searchValue)) {
//             return R.handleError(res, "invalid_device_format", 400);
//         }
//         if (searchKey === "mobile" && !V.mobile(searchValue)) {
//             return R.handleError(res, "invalid_mobile_format", 400);
//         }
//         if (searchKey === "identified" && !V.identified(searchValue)) {
//             return R.handleError(res, "invalid_identified_format", 400);
//         }
//
//         let decoderResponse;
//         if (searchKey === "mobile"){
//             const contactResponse = await Contact.getContactByMobile(searchValue)
//             if (!contactResponse){
//                 return R.response(false, 'contact_not_found', res, 404);
//             }
//
//             // const subscriberResponse = await Subscriber.getSubscriberByContactId(contactResponse.id);
//
//             decoderResponse = await Decoder.search('id', contactResponse.id);
//         }else {
//             decoderResponse = await Decoder.search(searchKey, searchValue);
//             if(!decoderResponse){
//                 const gateway = 1963;
//                 // return R.response(false, 'decoder_searched_not_found', res, 404);
//                 const decoderApiResponse = await Decoder.getApiResponse(searchValue, gateway);
//                 if (!decoderApiResponse){
//                     return R.response(false, 'decoder_searched_not_found', res, 404);
//                 }
//                 // const country = new Country(decoderApiResponse.subscriber.city.country.alpha2, decoderApiResponse.subscriber.city.country.alpha3, decoderApiResponse.subscriber.city.country.dialcode, decoderApiResponse.subscriber.city.country.fr, decoderApiResponse.subscriber.city.country.en, null, null)
//                 // const countryData = await country.save();
//                 // if (!countryData){
//                 //     return R.handleError(res, 'error_during_saving_of_country', 500);
//                 // }
//                 // console.log("countryData is :", countryData)
//                 //
//                 // const city = new City(null, null, decoderApiResponse.subscriber.city.name, countryData);
//                 // const cityData = await city.save()
//                 // if (!cityData){
//                 //     return R.handleError(res, 'error_during_saving_of_city', 500);
//                 // }
//                 //
//                 // const contact = new Contact(null, null, decoderApiResponse.subscriber.firstname, decoderApiResponse.subscriber.lastname, decoderApiResponse.subscriber.location, decoderApiResponse.subscriber.language, decoderApiResponse.subscriber.gender, decoderApiResponse.subscriber.mobile, decoderApiResponse.subscriber.email, cityData);
//                 // const contactData = await contact.savedByApi();
//                 // if (!contactData){
//                 //     return R.handleError(res, 'error_during_saving_contact_from_api', 500);
//                 // }
//                 // const subscriber = new Subscriber(null, null, contactData.id);
//                 // const subscriberData = await subscriber.savedByApi();
//                 // if (!subscriberData){
//                 //     return R.handleError(res, 'error_during_saving_subscriber_from_api', 500);
//                 // }
//                 // const formulaData = await Formula.getFormula(decoderApiResponse.formula.code);
//                 // if (!formulaData){
//                 //     return R.handleError(res, 'error_during_search_formula', 500);
//                 // }
//                 // console.log("formulaData is :", formulaData);
//                 // const decoder = new Decoder(null, null, decoderApiResponse.device, decoderApiResponse.identifier, decoderApiResponse.location, subscriberData.id, decoderApiResponse.started, decoderApiResponse.finished, decoderApiResponse.remaining, formulaData.id, null, decoderApiResponse.existed, decoderApiResponse.verified, decoderApiResponse.forbidden, decoderApiResponse.comment);
//                 // console.log("decoder is:", decoder);
//                 // decoderResponse = await decoder.save();
//                 // if (!decoderResponse){
//                 //     return R.response(false, 'decoder_api_saved_failed', res, 500);
//                 // }
//                 // return R.response(true, decoderResponse.toJson(), res, 200);
//                 // console.log("decoderResponse is:", decoderApiResponse.subscriber.city.country.alpha3);
//
//                 return R.response(false, decoderApiResponse, res, 200, true);
//             }
//         }
//
//         return R.response(true, decoderResponse.toJson(), res, 200);
//     }
//     catch (error){
//         return R.handleError(res, error.message, 500);
//     }
// })
