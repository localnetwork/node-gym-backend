const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.NODE_PAYPAL_CLIENT_ID,
    'client_secret': process.env.NODE_PAYPAL_CLIENT_SECRET
}); 


module.exports = paypal;
