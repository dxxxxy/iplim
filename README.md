# iplim
A really simple and lightweight ip rate limiter for express.

## Install
```
npm i iplim
```

## Usage
Refer to [#Options](#options)
```js
const iplim = require("iplim")

app.use(iplim({
    timeout: 1000 * 60 * 15,
    limit: 15,
    window: 1000 * 60,
    exclude: [],
    verbose: false
}))
```

## Static content
You probably wouldn't want to limit requests to your static views.

- If you're using `express.static` to serve them, this is fine. It will not be affected by the middleware.

- If you are specifying a route for each view (ex: `app.get("/hey", (req, res) => res.sendFile("hey.html"))`), you MUST exclude them from the limiter by providing the exclude array as an option (ex: `exclude: ["/hey"]`).

## Options
> If you omit parameters, they will be set to their defaults as shown below. These are also documented in the middleware's code.
```javascript
timeout = 1000 * 60 * 15, //milliseconds the user has to wait after breaching the rules set
limit = 15, //number of requests allowed in the window
window = 1000 * 60, //milliseconds the limit has to reach (ex: 15 requests in 1 minute)
exclude = [], //exclude paths in this array from the limit (ex: "/hey")
verbose = false, //print every process step to the console
```