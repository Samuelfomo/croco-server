const express = require('express');
const {Subscription} = require("../lib/class/Subscription");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");
const {Decoder} = require("../lib/class/Decoder");
const {Formula} = require("../lib/class/Formula");
const {Option} = require("../lib/class/Option");
const {User} = require("../lib/class/User");
const {Subscriber} = require("../lib/class/Subscriber");
const {Account} = require("../lib/class/Account");
const {Payement} = require("../lib/class/Payement");
const {Status} = require("../lib/class/Status");
const {Operation} = require("../lib/class/Operation");

const router = express.Router();

router.post('/new', async(req, res) =>{
    try {
    const {guid, reference, duration, decoder, formula, options, user, mobile} = req.body;

    if (!Number(reference) || !formula.trim() || !Number(duration) || !Number(decoder) || !Number(user)){
        return R.handleError(res, W.errorMissingFields, 400);
    }
    const decoderData = await Decoder.getByDevice(decoder);
    if (!decoderData){
        return R.response(false, 'decoder_search_not_found', res, 404);
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

        const account = await Account.getAmount(userData.id);
        if (!account){
            return R.response(false, 'user_account_not_found', res, 404);
        }
        if (account.balance < amount){
            return R.response(false, 'insufficient_credit_balance', res, 400);
        }
        let code;
        code = "SUBSCRIPTION";
        const operationData = await Operation.getOperationByCode(code);
        if (!operationData){
            return R.response(false, 'operation_search_error', res, 404);
        }
        const statusValue = await Status.getStatus(operationData.id);
        if (!statusValue){
            return R.response(false, 'status_search_error', res, 404);
        }

        let subscriptionResponse;
        const subscriptionData = new Subscription(null, guid, reference, true, duration, amount, formulaData.amount, optionData.amount, statusValue.id, operationData.id, decoderData.id, subscriberData.id, formulaData.id, oldFormulaData.id, optionData.id, userData.id, null, null )
        subscriptionResponse = await subscriptionData.save();
        if (!subscriptionResponse){
            return R.response(false, 'subscription_save_error', res, 500);
        }

         code = "PAYEMENT";
        const operation = await Operation.getOperationByCode(code);
        if (!operation){
            return R.response(false, 'operation_search_error', res, 404);
        }
        const status = await Status.getStatus(1);
        // const status = await Status.getStatus(operation.id);
        if (!status){
            return R.response(false, 'status_search_error', res, 404);
        }
        let payementResponse;
        const payement = new Payement(null, null, amount, account.id, false, account.balance, status.id, subscriptionResponse.id, null, mobile, null);
         payementResponse = await payement.save();
         if(!payementResponse){
             const statusFailed = await Status.getStatusFailed(1);
             subscriptionResponse = await Subscription.updateStatus(subscriptionResponse.id, statusFailed.id);
             if (!subscriptionResponse){
                 return R.response(false, 'subscription_update_status_error', res, 500);
             }
         }
         const newBalance = payementResponse.old_balance - amount;
         const newAccountBalance = await Account.updateBalance(payementResponse.account, newBalance);
         if (newAccountBalance === false){
             return R.response(false, 'operation_for_created_new_balance_failed', res, 500);
         }
         // const nextStatus = await Status.getNextStatus(subscriptionResponse.status);
         // console.log(nextStatus.nextState, nextStatus)
          subscriptionResponse = await Subscription.updateStatus(subscriptionResponse.id, subscriptionResponse.status.nextState);
          if (!subscriptionResponse){
              return R.response(false, 'subscription_update_next_status_error', res, 500);
          }

        return R.response(true, subscriptionResponse.toJson(), res, 200);

    } catch (error){
        return R.handleError(res, error.message, 500);
    }
})

module.exports = router;