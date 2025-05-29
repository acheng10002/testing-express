const express = require("express");
// middleware to handle file uploads
const multer = require("multer");
const path = require("path");
// initializes an instance of Express.Router
const index = express.Router();

const upload = multer({ dest: "uploads/" });

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

// defines a GET route to /user - when client makes a GET request to /user
index.get("/user", (req, res) => {
  // server responds with a 200 status code and a JSON object
  res.status(200).json({ name: "john" });
});

// defines a GET route to /user/auth - when client makes a GET request to /user/auth
index.get("/user/auth", (req, res) => {
  // extracts Authorization header from the incoming request (it has Basic auth credentials)
  const auth = req.headers.authorization;

  /* checks for Basic Auth header 
  if the Authorization header is missing or if it doesn't start with Basic */
  if (!auth || auth.indexOf("Basic") === -1) {
    // respond with 401 Unauthorized a JSON error message
    return res.status(401).json({ message: "Missing Authorization Header" });
  }

  /* decodees base64 credentials 
  extracts the base64-encoded credentials by splitting the header */
  const base64Credentials = auth.split(" ")[1];
  // decodes the base64 string into plain-text form, username:password
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  // splits the decoded string into username and password values
  const [username, password] = credentials.split(":");

  // checks if provided username and password match hardcoded username and password
  if (username !== "username" || password !== "password") {
    // if not, responds with 401 Unauthorized and an error message
    return res
      .status(401)
      .json({ message: "Invalid Authentication Credentials" });
  }

  // if authenticated, send 200 OK response and return JSON response
  res.status(200).json({ message: "Authenticated user data" });
});

index.post("/users", (req, res) => {
  const { name } = req.body;

  // checks if req.body.name === 'john'
  if (name === "john") {
    // responds with 200 and JSON if true
    return res.status(200).json({ message: `User ${name} created` });
  }

  return res.status(400).json({ message: "Invalid user data" });
});

index.get("/users", (req, res) => {
  // responds with JSON including an `email` field
  res.status(200).json({ email: "foo@bar.com" });
});

index.post("/user", (req, res) => {
  const { name } = req.body;

  // Normalize name to lowercase
  const normalizedName = name.toLowerCase();

  // Respond with a fixed id and normalized name
  res.status(200).json({
    id: "some fixed id",
    name: normalizedName,
  });
});

/* post route to index 
uses multer middleware to handle sing-file upload from the form field named avatar */
index.post("/", upload.single("avatar"), (req, res) => {
  // extracts name (plain text field) and complex_object (expected JSON string)
  const { name, complex_object } = req.body;
  // extracts file, parsed by multer and holds file metadata
  const file = req.file;

  // parses complex_object into JSON
  let complexObjectParsed;
  try {
    // tries to parse it into a real JS object
    complexObjectParsed = JSON.parse(complex_object);
  } catch (e) {
    // if parsing fails, return 400 bad request
    return res.status(400).json({ error: "Invalid JSON in complex_object" });
  }
  /* if successful, respond with JSON body with submitted name, parsed complexObject,
  fileOriginalName */
  res.status(200).json({
    name,
    complexObject: complexObjectParsed,
    fileOriginalName: file.originalname,
  });
});

// defines GET /persist/ route that sets cookie=hey
index.get("/persist/", (req, res) => {
  // server responds by setting a cookie named cookie with value 'hey' in the Set-Cookie header
  res.cookie("cookie", "hey");
  /* server sends an empty response body 
  client receives the response, reads the header, and stores the cookie on the client side
  client attaches it to future requests to the same domain/path, 
  so on next requests, req.cookies with include the cookie */
  res.send();
});

// defines GET /persist/return route that reads and returns the cookie
index.get("/persist/return", (req, res) => {
  // checks if client's incoming request has a cookie named cookie
  if (req.cookies.cookie) {
    // if yes, server sends the cookie's value (expected: 'hey') in response
    res.send(req.cookies.cookie);
  } else {
    // if no, server sends sad face
    res.send(":(");
  }
});

// reads cookies, validates values, returns 'hey' if correct
index.get("/api/content", (req, res) => {
  // destructures nameOne and nameTwo from the request's cookies
  const { nameOne, nameTwo } = req.cookies;
  // checks if nameOne and nameTwo matches expected values
  if (nameOne === "valueOne" && nameTwo === "valueTwo") {
    // sends hey if both match
    res.send("hey");
  } else {
    res.status(400).send("Missing or invalid cookies");
  }
});

module.exports = index;
