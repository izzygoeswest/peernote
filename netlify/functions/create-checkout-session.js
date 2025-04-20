const stripe = require('stripe')('sk_test_51RFpbxRXDDeRwNbpBete8OKWW6yVMBJN2BI1s4QQF3ExmceUqren4ZouRqQrnwPbqZPuWVZb21ZAFmtIoJVdMkx500QZhgrUSb'); // Replace with your Stripe secret key

exports.handler = async (event) => {
  const { plan } = JSON.parse(event.body);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1RFpwrRXDDcRwNbpa8mTJAnY', // Replace with your actual Stripe price ID
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:5173/dashboard?success=true',
      cancel_url: 'http://localhost:5173/pricing?canceled=true',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
