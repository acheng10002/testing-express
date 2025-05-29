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
// reads cookies from requests
const cookieParser = require("cookie-parser");

// initializes an instance of express
const app = express();

app.use(cookieParser());

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

/* shell - CLI that allows me to interact with the operating system by typing commands
-- shell invokes or launches runtimes
runtime - environment that executes code, it turns static code into an execution process
-- includes engine, memory management, I/O handling, and system interactions
--- engine - core software component that interprets, compiles, or executes code or performs
             specialized processing
             - handles low-level mechanics behind the scenes
             - exs. - JavaScript engines that compile and run JS
                    -- V8 engine for Chrome and Node.js
                    -- JavaScriptCore engine for Safari
                    - DB engines that handle how queries are executed and how data is stored/retrieves
                    -- MySQL engine
                    -- PostgreSQL engine
                    - Search engines index and search across huge datasets
-- exs. Node.js runtime runs JS outside the browser
        JVM runs Java bytecode
        Python interpreter runs .py files
-- extension runtime - specialized runtime environments separate from the web page used by
                       extensions/add-ons
--- a sandboxed JS environment with privileged APIs
- API - contract for interacting with software, hiding the implementation but exposing usable operations
-- APIs have two sides: the API, side exposing a surface, and the caller, the side consuming the surface
-- usable operations that get exposed are functions, methods, or endpoints for developers to use
-- set of rules and interfaces that lets software components communicate with each other
-- microservice - API between two servers
-- web/mobile app - between a client and a server
-- module interfaces - inside a single app
-- exs. WebAPIs - REST architecture where I send HTTP requests to an endpoint to create or retrieve users
        BrowserAPIs - fetch(), localStorage, document.querySelector() that allow JS in the browser to 
                      interact with the network, storage, or DOM
        Library APIs - React exposes utility functions or components that I can call
                       React provider side provides components, hooks, JSX syntax, context, refs, portals
                       Me on the caller side write the functional components, hook calls, JSX templates, context consumers, etc.
        Operating System API - Windows, macOS are system-level APIs for file handling, networking, etc.
                               macOS provider side gives me access to OS services, control over windows, inputs, file system, etc.
                               Me on the caller side, my app request services, data, or operations through the macOS API
- hook - point where custom logic can attach into an existing process or lifecycle
-- ex. SuperTest hook - internal mechanism letting SuperTest inject requests directly into Express
-- ex. React hook - function that taps into React component behavior
- function - doSomething() - not tied to any object
             function add(a, b) { return a + b; } → add(2, 3)
- method - object.doSomething() - owned by an object, is a property of the object
           const obj = { add(a, b) { return a + b; } }; → obj.add(2, 3)
*/
