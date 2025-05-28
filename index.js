const express = require("express");
// initializes an instance of Express.Router
const index = express.Router();

const array = [];

// defines a GET route at / - when client makes a GET request to /
index.get("/", (req, res) => {
  // server responds with a JSON object
  res.json({ name: "frodo" });
});

/* defines a GET route at /test - when client makes a GET request to 
/test, server responds with a JSON object containing the array variable */
index.get("/test", (req, res) => res.json({ array }));

/* defines a POST route to /test - when clients sends a POST request to
/test with a JSON body like { "item": "newValue" } */
index.post("/test", (req, res) => {
  // server takes the value at req.body.item and pushes it into the array
  array.push(req.body.item);
  // server sends back plain text response "success!"
  res.send("success!");
});

module.exports = index;
