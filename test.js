// *** in a larger test suite, useful to abstract this part into its own file
// imports module I'm testing
const index = require("../index");

// imports testing library as function request
const request = require("supertest");
const express = require("express");

/* sets up new Express app 
will avoid calling app.listen and starting my server 
this way, only including bits I need for testing */
const app = express();

app.use(express.urlencoded({ exntended: false }));

// use the index router imported previously
app.use("/", index);
// ************

/* SuperAgent - low-level HTTP request helper library for Node.js and browsers
- lets me programmatically issue HTTP requests (.get(), .post(), .put(), 
  .delete() and chain methods like .set(), .send(), .query(), and .expect()
- .get(), .post(), .send() → come from SuperAgent
- SuperAgent is a general-purpose HTTP client similar to Axios or fetch, but not
  specific to testing
SuperTest - high-level HTTP assertion helper library
- .expect(), .end(), .then() chaining to assert responses easily inside tests 
- SyperTest plugs into test runners like Jest
- SuperTest extends SuperAgent, specializing SuperAgent for testing HTTP servers
-- I can pass my Express app instance directly to request() instead of 
   needing a full server running on a port 
-- comes with assertion helpers, ex. .expect() for status, headers, body, etc. 
-- SuperTest has better test-runner integration, works with Jest and removes the 
   need to spin up a server */
test("index route works", (done) => {
  // call request function on my Express app,
  request(app)
    // pass it my index route
    .get("/")
    // makes the request using HTTP/2 protocol only
    .http2()
    // use request function to make sure the response match the types...
    .expect("Content-Type", /json/)
    // and content I expect
    .expect({ name: "frodo" })
    /* done - used in most testing libaries to signal that the test is 
    complete in the case of async operations 
    - SuperTest is passed done in the last .expect and calls done for me */
    .expect(200, done);
});

test("testing route works", (done) => {
  request(app)
    // unlike above, instead tests the post method
    .post("/test")
    /* sets the Content-Type header of the outgoing HTTP request to 
    application/x-www-form-urlencoded , so the server knows what kind 
    of data format I'm sending, default is json 
    - takes the MIME type or the extension name, xml, json, png, etc. */
    .type("form")
    // sends the request body/JSON payload
    .send({ item: "hey" })
    /* can setup automatic serialization for types other than JSON and forms
    it's automatic for JSON and forms
    serializing - converting a JS object into a string or binary format 
                  suitable for transmission over the network 
    - before sending a request, I serialize an object to JSON, form-encoded string,
    or XML
    - on the server, I deserialize it back into a usuable data structure 
    - I can replace built-in serialization with .serialize() to send payload in a
    custom format */
    .serialize((obj) => {
      return "string generated from obj";
    })
    // waits for the POST requrest to finish
    .then(() => {
      request(app)
        // and then calls the GET request when the promise resolves
        .get("/test")
        // to check if that item has been pushed into the array
        .expect({ array: ["hey"] }, done);
    });
});

test("user route works", () => {
  // call request function on my Express app,
  request(app)
    // pass the request object to my user route to test the get method
    .get("/user")
    /* SuperAgent automatically retries requests if they fail 
    first arg - number of retries
    second arg- callback that .retry() calls before each retry 
                cb may return true/false to control whether request should be retried 
    - use .retry() only with requests that are idempotent (performing it once
    has the same effect as performing it multiple times */
    .retry(1, callback)
    // use request function to make sure the response matches the types...
    .expect("Content-Type", /json/)
    // length....
    .expect("Content-Length", "15")
    // and response status code
    .expect(200)
    /* .end runs the chained request and expectations that accepts a cb: 
    if any error occurs, immediately fail the test by throwing the error */
    .end(function (err, res) {
      if (err) throw err;
    });
});

/* Jest awaits the promise returned by the test function 
if the promise rejects sue to throw or failed .expect(), Jest catches the 
error and marks the test as failed */
// another way to test the get method to the user route
describe("GET /user", () => {
  it("responds with json", async () => {
    // call request function on my Express app and waits for it to finish
    const response = await request(app)
      // pass the request object to my user route to test the get method
      .get("/user")
      /* .set() with a field name and value sets header fields 
      - or pass an object to set several fields in a single call */
      .set("API-Key", "foobar")
      /* sets custom HTTP headers on the outgoing request
      Accept header tells the server: client prefers to receive the 
      response in JSON */
      .set("Accept", "application/json")
      // use request function to make sure the response matches the type
      .expect("Content-Type", /json/)
      // Jest does not need the done cb
      .expect(200);
  });
});

describe("SuperTest requests with http2 option", () => {
  test("basic request should return user JSON", async () => {
    // enables http2 protocol by appending an option
    await request(app, { http2: true })
      .get("/user")
      /* .accept() sets the Accept header */
      .accept("json")
      /* .query() accepts a single object and objects, used with GET method 
      to form a query string, /user?query=Manny 
      .query() accepts strings too, or joined */
      .query({ query: "Manny" })
      .expect("Content-Type", /json/)
      .expect("Content-Length", "15")
      .expect(200);
  });

  test("agent request should return user JSON", async () => {
    const agent = request.agent(app, { http2: true });

    await agent
      .get("/user")
      .query({ format: "json" })
      .query({ dest: "/login" })
      // an asciibetically-sorted query string can be enabled with req.sortQuery()
      .sortQuery()
      /* I can also provide a custom sorting function, comparison fn should take
      2 arg and return a -/0/+ integer
      .sortQuery(myComparisonFn) */
      .expect("Content-Type", /json/)
      .expect("Content-Length", "15")
      .expect(200);
  });
});

/* tests the post method to the user route 
expectations are run in the order of definition */
describe("POST /user", () => {
  it('user.name should be an case-insensitive match for "john"', async () => {
    // call request function on my Express app and waits for it to finish
    const response = await request(app)
      // pass the request object to my user route to test the post method
      .post("/user")
      // sends the request body/ x-www-form-urlencoded payload
      .send("name=john") // upload
      /* sets custom HTTP headers on the outgoing request
      Accept header tells the server: client prefers to receive the 
      response in JSON */
      .set("Accept", "application/json")
      // response body or headers can be modified before an assertion gets executed
      .expect(200);

    // takes the response HSON's name and normalizes it to lowercase
    const normalizedName = response.body.name.toLowercase();

    // builds a result object
    const result = {
      id: "some fixed id",
      name: normalizedName,
    };

    // checks if result object exactly equals the expected object
    expect(result).toStrictEqual({
      id: "some fixed id",
      name: "john",
    });
  });
});

// tests the get method to the user/auth route
describe("GET /user/auth", () => {
  it("responds with json", async () => {
    // call request function on my Express app and waits for it to finish
    const response = await request(app)
      // pass the request object to my user/auth route to test the get method
      .get("/user/auth")
      // sets client private key
      .key(key)
      // set client certificate chain
      .cert(cert)
      // sends Basic Auth
      .auth("username", "password")
      /* sets custom HTTP headers on the outgoing request
      Accept header tells the server: client prefers to receive the 
      response in JSON */
      .set("Accept", "application/json")
      // use request function to make sure the response matches the type
      .expect("Content-Type", /json/)
      /* superagent sends any HTTP error to the cb as the first argument
      if I do not add a status code expect */
      .expect(200);
  });
});

// tests the post method to the users route
describe("POST /users", () => {
  it("responds with json", async () => {
    // call request function on my Express app and waits for it to finish
    const response = await request(app)
      // pass the request object to my users route to test the post method
      .post("/users")
      /* writes a JSON string, sends the request body/JSON payload 
      I can use multiple .send() calls to write the data 
      - sending strings sets Content-Type to application/x-www-form-urlencoded */
      .send({ name: "john" })
      /* sets custom HTTP headers on the outgoing request
      Accept header tells the server: client prefers to receive the 
      response in JSON */
      .set("Accept", "application/json")
      // use request function to make sure the response matches the type
      .expect("Content-Type", /json/)
      // any thrown error from .expect() will automatically fail the test
      .expect(200);
  });
});

/* tests the get method to the users route to assert the correctedness of 
the returned data, uses promise chaining */
describe("GET /users", () => {
  it("responds with json", () => {
    // call request function on my Express app,
    return (
      request(app)
        // pass the request object to my users route to test the get method
        .get("/users")
        /* sets custom HTTP headers on the outgoing request
      Accept header tells the server: client prefers to receive the 
      response in JSON */
        .set("Accept", "application/json")
        // use request function to make sure the response matches the type
        .expect("Content-Type", /json/)
        // any thrown error from .expect() will automatically fail the test
        .expect(200)
        // runs after SuperTest request resolves
        .then((response) => {
          /* response.body is parsed JSON body returned from the server 
          Jest assertion that checks whether the email field equals exactly 
          the string "foo@bar.com"
          if it doesn't, Jest marks the test as failed */
          expect(response.body.email).toEqual("foo@bar.com");
        })
    );
  });
});

// tests the post method to the index route
describe("POST /", () => {
  it("should upload an avatar and handle fields correctly", async () => {
    // call request function on my Express app
    const response = await request(app)
      .post("/")
      // adds name field with a value
      .field("name", "my awesome avatar")
      // adds complex_object field as a JSON string and sets its content type
      .field("complex_object", JSON.stringify({ attribute: "value" }), {
        contentType: "application/json",
      })
      /* parse known
      .parse['application/json'] = function (str) {
        return {'object': 'parsed from str'};
    };
    I can set up a custom parser
    */
      /* attaches avatar.jpg file from the path under the form field named avatar,
      ensures the file path exists */
      .attach("avatar", path.join(__dirname, "test/fixtures/avatar.jpg"))
      // expects server to respond with status 200 OK and expected Content-Type header
      .expect(200)
      .expect("Content-Type", /json/);
    /* response assertions for structured checks 
    asserts response body has the correct name property */
    expect(response.body).toHaveProperty("name", "my awesome avatar");
    // asserts response body includes the complexObject property
    expect(response.body).toHaveProperty("complexObject");
    //  asserts complexObject property was parsed into a JS object
    expect(response.body.complexObject).toEqual({ attribute: "value" });
    // asserts the server correctly read and returned the uploaded file's original name
    expect(response.body).toHaveProperty("fileOriginalName", "avatar.jpg");
  });
});

/* if I am testing the same host, I can re-assign the request variable with 
the initialization app or url, and a new Test is created epr request.VERB() call */
request = request("http://localhost:5555");

/* SuperTest.agent(app) - special SuperTest client that persist cookies across multiple 
                          requests, similar to how a browser behaves 
- creates an isolated session for my test calls
- stores cookies received from the server (Set-Cookie responses)
- automatically sends those cookies in future requests made through the same agent 
- lets me test authenticated routes, session handling, or multi-step flows without
  manually passing headers or cookies */
describe("request.agent(app)", () => {
  const agent = request.agent(app);

  // test confirms the server issues the cookie correctly
  test("should save cookies", async () => {
    await agent
      /* agent builds and sends a GET request to "/persist/", no set-cookie with this 
      first request */
      .get("/persist/")
      /* agent captures the HTTP response and expects it to have a set-cookie response 
      header matching regex (agent runs .expect() checks */
      .expect("set-cookie", /cookie=hey; Path=\//)
      .expect(200);
  });

  test("should send cookies", async () => {
    /* same agent sends a get request to /persist/return, and now the agent has
    automatically attached the cookies in the request headers
    (the server initially set the cookie in the Set-Cookie response header
    but on future requests, the agent automatically attaches those cookies to 
    the request headers) */
    const response = await agent.get("/persist/return").expect(200);
    // expects the server's response body to be "hey" proving the server read the cookie
    expect(response.text).toBe("hey");
  });
});

// send cookie manually, expects 200 and 'hey'
describe("GET /api/content with cookies", () => {
  test('should respond with "hey" when valid cookies are present', async () => {
    // call request function on my Express app and waits for it to finish
    const response = await request(app)
      // pass the request object to my /api/content route to test the get method
      .get("/api/content")
      // sets custom Cookie header with two cookies on the outgoing request
      .set("Cookie", ["nameOne=valueOne; nameTwo=valueTwo"])
      // sends an empty body
      .send()
      .expect(200);
    expect(response.text).toBe("hey");
  });
});

/* 
request
    // .query() method for HEAD requests, path: /users?email=joe@smith.com
    .head('/users')
        .query({ email: 'joe@smith.com' })
        .then(res => {

        });

// POST the content of the HTML form identified by id="myForm"
request.post('/user')
    // sending a FormData object is supported
    .send(new FormData(document.getElementById('myForm')))
    .then(callback, errorCallback)
*/

/* do not run test code on production database 
test runner - tool that executes test files, tracks results, and reports outcomes 
- it runs tests, manages the setup, teardown, and hooks */
