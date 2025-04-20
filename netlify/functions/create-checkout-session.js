const stripe = require('stripe')('sk_test_51RFpbxRXDDeRwNbpBete8OKWW6yVMBJN2BI1s4QQF3ExmceUqren4ZouRqQrnwPbqZPuWVZb21ZAFmtIoJVdMkx500QZhgrUSb'); // <-- use your real Stripe secret key

exports.handler = async (event, context) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1Rprice_1RFpwrRXDDeRwNbpa8mTJAnY', // <-- your real Price ID
          quantity: 1,
        },
      ],
      success_url: 'https://peernote.netlify.app/dashboard?success=true',
      cancel_url: 'https://peernote.netlify.app/pricing?canceled=true',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
    };
  } catch (err) {
    console.error('Stripe error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
