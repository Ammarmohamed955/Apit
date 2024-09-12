const express = require("express");
const stripe = require('stripe')('sk_test_51PrBkoP48Ggiu9mp0ZaJBk3vT7GGblvOGobI2hjTmpuyDHP86oYE1cvZHgetxU6wLSZ7muIt1JZOYqsBgQZtZJth00B5Wi0NIy');
const axios = require('axios');

const cors = require("cors");
const app = express();
const products = require("./products");

const YOUR_DOMAIN = 'http://localhost:5000';
const STRAPI_API_URL = 'http://localhost:1337'; // رابط Strapi API



app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome our to online shop API...");
});

app.get("/products", (req, res) => {
  res.send(products);
});

app.get("/products/:id", (req, res) => {
  const oneProduct = products.find((item) => {
    return item.id == req.params.id;
  });

  res.send(oneProduct);
});



app.post('/create-checkout-session', async (req, res) => {
  const { cartItems } = req.body;

  // تحويل عناصر السلة إلى الصيغة المطلوبة لـ Stripe
  const lineItems = cartItems.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.productName,
      },
      unit_amount: item.price * 100, // Stripe يتطلب السعر بالمليم (cents)
    },
    quantity: item.quantity,
  }));

  try {
    // إنشاء جلسة Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/success.jsx`,
      cancel_url: `${YOUR_DOMAIN}/cancel.jsx`,
    });

    // بعد إنشاء الجلسة بنجاح، قم بكتابة الطلب في Strapi
    await axios.post(`${STRAPI_API_URL}/orders`, {
      data: {
        products: cartItems,
        stripeSessionId: session.id,
        totalAmount: lineItems.reduce((acc, item) => acc + (item.price_data.unit_amount * item.quantity), 0),
      },
    });

    res.redirect(303, session.url);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).send('Server error');
  }
});




const port = 5000;
app.listen(port, console.log(`http://localhost:${port}`));