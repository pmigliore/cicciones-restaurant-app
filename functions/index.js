const functions = require("firebase-functions");

exports.getMaps = functions.runWith({ secrets: ["MAPS_API"] }).https.onRequest(async (request, response) => {

  const apiKey = `${process.env.MAPS_API}`
  
  response.json({
    key: apiKey
  })
  
});

exports.addCardForExistingCustomer = functions.runWith({ secrets: ["STRIPE_SECRET"] }).https.onRequest(async (req, res) => {

  const stripe = require('stripe')(`${process.env.STRIPE_SECRET}`);
  
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: req.body.customer },
      {apiVersion: '2020-08-27'}
    );
  
    const setupIntent = await stripe.setupIntents.create({
      customer: req.body.customer
    });

    const paymentMethods = await stripe.paymentMethods.list({
      customer: req.body.customer,
      type: 'card',
    });
    
    res.json({
      setupIntent: setupIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: req.body.customer,
      paymentMethods: paymentMethods,
    })
});

exports.chargeCustomer = functions.runWith({ secrets: ["STRIPE_SECRET"] }).https.onRequest(async (req, res) => {

  const stripe = require('stripe')(`${process.env.STRIPE_SECRET}`);
  
  const ephemeralKey = await stripe.ephemeralKeys.create(
    {customer: req.body.customer},
    {apiVersion: '2020-08-27'}
  );  
    
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "usd",
    customer: req.body.customer,
    automatic_payment_methods: {
      enabled: true,
    },
    receipt_email: req.body.email,
  });
  
  res.json({
    paymentIntent: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    customer: req.body.customer,
    ephemeralKey: ephemeralKey.secret
  });
});

exports.refundCustomer = functions.runWith({ secrets: ["STRIPE_SECRET"] }).https.onRequest(async (req, res) => {

  const stripe = require('stripe')(`${process.env.STRIPE_SECRET}`);
  
  const response = await stripe.refunds.create({
    payment_intent: req.body.paymentIntentId,
  });
  
  res.json({
    result: response
  })
});

exports.deleteCustomer = functions.runWith({ secrets: ["STRIPE_SECRET"] }).https.onRequest(async (req, res) => {

  const stripe = require('stripe')(`${process.env.STRIPE_SECRET}`);
  
  const deleted = await stripe.customers.del(
    req.body.customer
  );
});

exports.addCustomerToStripe = functions.runWith({ secrets: ["STRIPE_SECRET"] }).https.onRequest(async (request, response) => {

  const stripe = require('stripe')(`${process.env.STRIPE_SECRET}`);

  const customer = await stripe.customers.create({
    email: `${request.body.email}`,
    name: `${request.body.name}`
  });
  
  response.json({
    customer: customer.id
  })
});

exports.getStripePublicKey = functions.runWith({ secrets: ["STRIPE_PUB_KEY"] }).https.onRequest(async (request, response) => {
  
  response.json({
    publishableKey: `${process.env.STRIPE_PUB_KEY}`
  })
});


