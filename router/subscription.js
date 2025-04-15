const express = require('express');
const {Subscription} = require("../lib/class/Subscription");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");
const V = require("../lib/shared/utils/validation");
const {Decoder} = require("../lib/class/Decoder");
const {Formula} = require("../lib/class/Formula");
const {User} = require("../lib/class/User");
const {Account} = require("../lib/class/Account");
const {Transaction} = require("../lib/class/Transaction");
const {Status} = require("../lib/class/Status");
const {Operation} = require("../lib/class/Operation");
const {Subscriber} = require("../lib/class/Subscriber");

const router = express.Router();

router.post('/renew', async(req, res) =>{
    try {
    const {guid, reference, duration, decoder, formula, options, user, gateway, pin, codeUser} = req.body;

    if (!formula || !formula.trim() || !Number(duration) || !Number(decoder) || !Number(user)){
        return R.handleError(res, W.errorMissingFields, 400);
    }

    if (!V.device(decoder)){
        return R.handleError(res, 'entry_detected_error', 400);
    }

        // search decoder
    const decoderData = await Decoder.getByDevice(decoder);
    if (!decoderData){
        return R.response(false, 'decoder_search_not_found', res, 404);
    }

        // search subscriber by decoder
    const subscriberData = await Subscriber.getSubscriberByGuid(decoderData.subscriber.code)
    // const subscriberData = await Contact.getContactByGuid(decoderData.subscriber.code)
   if (!subscriberData){
       return R.response(false, 'subscriber_search_error', res, 404);
   }

   const oldFormulaData = await Formula.getFormulaByCode(decoderData.formula.code);
   if (!oldFormulaData){
       return R.response(false, 'old_formula_search_error', res, 404);
   }

    const formulaData = await Formula.getFormulaByCode(formula);
    if (!formulaData){
        return R.response(false, 'formula_search_error', res, 404);
    }
    if (formulaData.is_option !== false) {
        return R.response(false, 'invalid_formula', res, 400);
    }

    let family = "RENEWAL";
    if (oldFormulaData.code !== formulaData.code){
        family = "UPGRADE";
    }

        // let optionData = "";
        let optionsArray = [];
        let totalOptionAmount = 0;

        if (options) {
            if (Array.isArray(options)) {
                optionsArray = options;
            } else if (typeof options === "string") {
                optionsArray = options.split(",");
            } else {
                return R.response(false, "Invalid options format", res, 400);
            }
        }

        // ✅ Vérification que toutes les options existent
        let validOptions = [];
        for (let optionCode of optionsArray) {
            const optionResult = await Formula.getFormulaByCode(optionCode.trim());
            if (!optionResult) {
                return R.response(false, `Option "${optionCode}" not found`, res, 404);
            }
            if (optionResult.is_option !== true) {
                return R.response(false, 'invalid_option', res, 400);
            }
            validOptions.push(optionResult.id);

            if (formulaData.includes.some(entry => entry.code === optionResult.code)) {
                optionResult.amount = 0
            }
            totalOptionAmount += optionResult.amount;
        }

        const userData = await User.getUserByGuid(user);
        if (!userData){
            return R.response(false, 'user_search_error', res, 404);
        }
        //  court de la subscription
        const amount = (formulaData.amount + totalOptionAmount) * duration;

        const account = await Account.getAmount(userData.id);
        if (!account){
            return R.response(false, 'user_account_not_found', res, 404);
        }
        if (account.balance < amount){
            return R.response(false, 'insufficient_credit_balance', res, 400);
        }

        // section subscription
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
        const subscriptionData = new Subscription(null, guid, reference, true, duration, amount, formulaData.amount, totalOptionAmount, statusValue.id, operationData.id, decoderData.id, formulaData.id, oldFormulaData.id, validOptions, userData.id, null, null )
        subscriptionResponse = await subscriptionData.save();
        if (!subscriptionResponse){
            return R.response(false, 'subscription_save_error', res, 500);
        }

         code = "PAYEMENT";
        const operation = await Operation.getOperationByCode(code);
        if (!operation){
            return R.response(false, 'operation_search_error', res, 404);
        }
        const status = await Status.getStatus(operation.id);
        // const status = await Status.getStatus(operation.id);
        if (!status){
            return R.response(false, 'status_search_error', res, 404);
        }
        let payementResponse;
        const payement = new Transaction(null, null, amount, account.id, false, account.balance, status.id, subscriptionResponse.id, null);

        payementResponse = await payement.saved();
         if(!payementResponse){
             const statusFailed = await Status.getStatusFailed(operationData.id);
             subscriptionResponse = await Subscription.updateStatus(subscriptionResponse.id, statusFailed.id);
             if (!subscriptionResponse){
                 return R.response(false, 'subscription_update_status_error', res, 500);
             }
         }
         const newBalance = payementResponse.old_balance - amount;
         const newAccountBalance = await Account.updateBalance(payementResponse.account, newBalance);
         if (newAccountBalance === false){
             const payementStatusFailed = await Status.getStatusFailed(operation.id);
             const payementFailed = await Transaction.updatedStatus(payementResponse.id, payementStatusFailed.id);
             if(!payementFailed){
                 return R.response(false, 'payement_update_status_error', res, 500);
             }
             const statusFailed = await Status.getStatusFailed(operationData.id);
             subscriptionResponse = await Subscription.updateStatus(subscriptionResponse.id, statusFailed.id);
             if (!subscriptionResponse){
                 return R.response(false, 'subscription_update_status_error', res, 500);
             }
         }
         console.log(subscriptionResponse.status.nextState);
         const sendSubscription = await Subscription.sender(decoder, formula, options, duration, gateway, pin, codeUser);
         if (!sendSubscription){
             return R.response(false, 'sender_subscription_error', res, 500);
         }

          subscriptionResponse = await Subscription.updateStatus(subscriptionResponse.id, subscriptionResponse.status.nextState);
          if (!subscriptionResponse){
              return R.response(false, 'subscription_update_next_status_error', res, 500);
          }
          const result = subscriptionResponse.toJson();

        return R.response(true, {...result, family: family}, res, 200);

    } catch (error){
        return R.handleError(res, error.message, 500);
    }
})

router.put('/myActivity', async (req, res) => {
    try {
        const { user, dateStart, dateEnd  } = req.body;

        if (!V.guid(user)) {
            return R.handleError(res, W.errorMissingFields, 400);
        }

        const userResponse = await User.getUserByGuid(user);

        if (!userResponse) {
            return R.response(false, 'user_not_found', res, 404);
        }
        const dateF = new Date();
        const dateB = new Date(dateF.getTime() - 30 * 24 * 60 * 60 * 1000);
        let dateFinish = dateF.toISOString().split('T')[0];
        let dateBeginning = dateB.toISOString().split('T')[0];

        if (dateStart){
            console.log("I'm here")

             dateFinish = dateEnd || dateStart;
             dateBeginning = dateStart;

            // Vérification du format des dates
            if (!V.date(dateBeginning) || !V.date(dateFinish)) {
                return R.handleResponse(res, 'incorrect_date_format', 400);
            }

            // Comparaison des dates
            if (new Date(dateFinish) < new Date(dateBeginning)) {
                return R.handleResponse(res, 'date_end_before_start', 400);
            }
        }

        console.log("dateFinish", dateFinish, "dateStart", dateBeginning);

        const userActivity = await Subscription.getActivityUser(userResponse.id, dateBeginning, dateFinish);

        if (!userActivity) {
            return R.response(false, 'user_activity_not_found', res, 404);
        }

        const result = await Promise.all(userActivity.map(async (item) => (await Subscription.fromJson(item)).toJson()));

        return R.response(true, result, res, 200);
    } catch (error) {
        return R.handleError(res, error.message, 500);
    }
});

// router.post('/simulated', async (req, res) => {
//     try {
//         const { decoder, formula, options, duration } = req.body;
//     }  catch (error) {
//         return R.handleError(res, error.message, 500);
//     }
// })

module.exports = router;
