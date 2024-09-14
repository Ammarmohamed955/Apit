const express = require("express");
const cors = require("cors");
const app = express();
const products = require("../products");
const Offer = require("../Offer.js")
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
app.get("/offer", (req, res) => {
  res.send(Offer);
});
app.get("/offer/:id", (req, res) => {
  const oneOffer = Offer.find((item) => {
    return item.id == req.params.id;
  });

  res.send(oneOffer);
});
const port = 5000;
app.listen(port, console.log(`http://localhost:${port}`));