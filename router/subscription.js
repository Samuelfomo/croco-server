const express = require('express');
const {Subscription} = require("../lib/class/Subscription");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");
const {Decoder} = require("../lib/class/Decoder");
const {Formula} = require("../lib/class/Formula");
const {Option} = require("../lib/class/Option");
const {User} = require("../lib/class/User");
const {Subscriber} = require("../lib/class/Subscriber");

const router = express.Router();

router.post('/new', async(req, res) =>{
    try {
    const {guid, reference, duration, decoder, formula, options, user} = req.body;

    if (!reference || !formula || !duration || !decoder || !user){
        return R.handleError(res, W.errorMissingFields, 400);
    }
    const decoderData = await Decoder.getByGuid(decoder);
    if (!decoderData){
        return R.response(false, 'decoder_search_error', res, 404);
    }
        console.log("decoderData is :", decoderData);
    const subscriberData = await Subscriber.getSubscriber(decoderData.subscriber.code)
   if (!subscriberData){
       return R.response(false, 'subscriber_search_error', res, 404);
   }
   console.log("subscriberData is:", subscriberData);

   const oldFormulaData = await Formula.getFormula(decoderData.formula.guid);
   if (!oldFormulaData){
       return R.response(false, 'old_formula_search_error', res, 404);
   }
    console.log("oldFormulaData is:", oldFormulaData);
    const formulaData = await Formula.getFormulaByCode(formula);
    if (!formulaData){
        return R.response(false, 'formula_search_error', res, 404);
    }
    console.log("formulaData is :", formulaData)
        let optionData = options;
        if(options && options.trim()){
             optionData = await Option.getByCode(options);
            if (!optionData){
                return R.response(false, 'option_search_error', res, 404);
            }
        }
        console.log("optionData is:", optionData)
        const userData = await User.getUser(user);
        if (!userData){
            return R.response(false, 'user_search_error', res, 404);
        }
        console.log("userData is :", userData)

        const amount = formulaData.amount + optionData.amount;
        console.log("amount is :", amount);
        const subscriptionData = new Subscription(null, guid, reference, true, duration, amount, formulaData.amount, optionData.amount, null, null, decoderData.id, subscriberData.id, formulaData.id, oldFormulaData.id, optionData.id, userData.id, null )
        const subscriptionResponse = await subscriptionData.save();
        if (!subscriptionResponse){
            return R.response(false, 'error_during_saved', res, 500);
        }
        return R.response(true, subscriptionResponse.toJson(), res, 200);
    } catch (error){
        return R.handleError(res, error.message, 500);
    }
})

module.exports = router;