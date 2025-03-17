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

    if (!Number(reference) || !formula.trim() || !Number(duration) || !Number(decoder) || !Number(user)){
        return R.handleError(res, W.errorMissingFields, 400);
    }
    const decoderData = await Decoder.getByDevice(decoder);
    if (!decoderData){
        return R.response(false, 'decoder_search_error', res, 404);
    }

    const subscriberData = await Subscriber.getSubscriber(decoderData.subscriber.code)
   if (!subscriberData){
       return R.response(false, 'subscriber_search_error', res, 404);
   }

   const oldFormulaData = await Formula.getFormula(decoderData.formula.code);
   if (!oldFormulaData){
       return R.response(false, 'old_formula_search_error', res, 404);
   }

    const formulaData = await Formula.getFormulaByCode(formula);
    if (!formulaData){
        return R.response(false, 'formula_search_error', res, 404);
    }

        let optionData = options;
        if(options && options.trim()){
             optionData = await Option.getByCode(options);
            if (!optionData){
                return R.response(false, 'option_search_error', res, 404);
            }
        }

        const userData = await User.getUser(user);
        if (!userData){
            return R.response(false, 'user_search_error', res, 404);
        }

        const amount = (formulaData.amount + optionData.amount) * duration;
        console.log("amount is :", amount);
        const subscriptionData = new Subscription(null, guid, reference, true, duration, amount, formulaData.amount, optionData.amount, null, null, decoderData.id, subscriberData.id, formulaData.id, oldFormulaData.id, optionData.id, userData.id, null, null )
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