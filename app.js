/* - use SuperTest module to test Express routes/controllers
-- What is the motivation behind SuperTest
- Describe how SuperTest handles my Express application 
- Explain the functionality superagent provides to SuperTest
-- What are the methods provided by SuperAgent to handle multipart requests and how to 
   use them
- Describe what the done parameter is used for
-- What is the purpose of done? What convenience does SuperTest provide concerning it?
- Explain and have a firm understanding of .expect() method's functionality
-- What is the difference in handling errors when using .end() method in conjunction 
   with .expect() provided by SuperTest?
- Have familiarity with supertest's docs and methods */

// Express.Router separates routes into their own exported modules
const express = require("express");

// initializes an instance of express
const app = express();

/* middleware - function that receives a HTTP request, can modify the req or res, and 
                decide whether to pass control to the next middleware with next() or end 
                the req-res cycle by sending a response
                function (req, res, next)
- they can parse incoming data - express.json() or express.urlencoded()
- they can authenticate users - passport
- they can serve static files - express.static 
Express runs the middleware in the order they are registered when a request hits the server
registers middleware that parses incoming requests that are typical form submissions
with Content-Type: application/x-www-form-urlencoded, and makes the parsed data available
on req.body */
app.use(express.urlencoded({ extended: false }));

const indexRouter = require("./index");
app.use("/", indexRouter);

app.listen(3000, () => console.log("running"));
