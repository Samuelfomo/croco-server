const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const SubscriptionModel = require(path.join(paths.MDL_DIR, 'SubscriptionModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));
const {Decoder} = require("./Decoder");
const {Subscriber} = require("./Subscriber");
const {Formula} = require("./Formula");
const {Option} = require("./Option");
const {User} = require("./User");

class  Subscription {
    constructor(id = null, guid = null, reference, self_service, duration, amount, formula_cost, options_cost, status = null, operation = null, decoder, subscriber, formula, old_formula = null, options = null, user, comment = null) {
        this.id = id;
        this.guid = guid;
        this.reference = reference;
        this.self_service = self_service;
        this.duration = duration;
        this.amount = amount;
        this.formula_cost = formula_cost;
        this.options_cost = options_cost;
        this.status = status;
        this.operation = operation;
        this.decoder = decoder;
        this.subscriber = subscriber;
        this.formula = formula;
        this.old_formula = old_formula;
        this.options = options;
        this.user = user;
        this.comment = comment
    }

    static async fromJson(json) {
        const decoderResponse = await Decoder.getDecoderById(json.decoder);
        const decoderResult = decoderResponse.toJson();

        const subscriberResponse = await Subscriber.getSubscriberById(json.subscriber);
        const formulaResponse = await Formula.getFormulaById(json.formula);
        const oldFormulaResponse = await Formula.getFormulaById(json.old_formula);
        let optionsResponse = json.options;
        if (json.options){
            optionsResponse = await Option.getOptionById(json.options)
        }

        const userResponse = await User.getById(json.user);

        return new Subscription(
            json.id, json.guid, json.reference, json.self_service, json.duration, json.amount, json.formula_cost,
            json.options_cost, json.status, json.operation, decoderResult, subscriberResponse, formulaResponse,
            oldFormulaResponse, optionsResponse, userResponse, json.comment
        )
    }

    async _duplicate() {
        const existingEntry = await SubscriptionModel.findOne({
            where: { reference: this.reference }
        });
        await W.isOccur(existingEntry, W.duplicate);
    }

    async save(){
        try {
            await W.isOccur(!SubscriptionModel, 'SubscriptionModel is not properly initialized');
            let entry;
            if (!this.guid){
                await this._duplicate();

                const db = new Db();
                const guid = await db.generateGuid(SubscriptionModel, 6);
                entry = await  SubscriptionModel.create({
                    guid: guid,
                    reference: this.reference,
                    self_service: this.self_service,
                    duration: this.duration,
                    amount: this.amount,
                    formula_cost: this.formula_cost,
                    options_cost: this.options_cost,
                    status: this.status,
                    operation: this.operation,
                    decoder: this.decoder,
                    subscriber: this.subscriber,
                    formula: this.formula,
                    old_formula: this.old_formula,
                    options: this.options,
                    user: this.user,
                    comment: this.comment,
                })
            }
            else {
                const existingEntry = await SubscriptionModel.findOne({
                    where: { guid: this.guid }
                });
                await W.isOccur(!existingEntry, W.errorGuid);

                await SubscriptionModel.update(
                    {
                        reference: this.reference,
                        self_service: this.self_service,
                        duration: this.duration,
                        amount: this.amount,
                        formula_cost: this.formula_cost,
                        options_cost: this.options_cost,
                        status: this.status,
                        operation: this.operation,
                        decoder: this.decoder,
                        subscriber: this.subscriber,
                        formula: this.formula,
                        old_formula: this.old_formula,
                        options: this.options,
                        user: this.user,
                        comment: this.comment,
                    },
                    {
                        where: { guid: this.guid }
                    });
                entry = await SubscriptionModel.findOne({
                    where: { guid: this.guid }
                });
            }
            return Subscription.fromJson(entry.toJSON());
        } catch (error) {
            throw  error;
        }
    }

    toJson(){
        return{
            code: this.guid,
            reference: this.reference,
            self_service: this.self_service,
            duration: this.duration,
            amount: this.amount,
            formula_cost: this.formula_cost,
            options_cost: this.options_cost,
            status: this.status,
            operation: this.operation,
            decoder: this.decoder,
            subscriber: this.subscriber,
            formula: this.formula,
            old_formula: this.old_formula,
            options: this.options,
            user: this.user,
            comment: this.comment,
        }
    }
}

module.exports = {Subscription};