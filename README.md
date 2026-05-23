# iplim
A really simple and lightweight ip rate limiter for express.

## Features
- Zero production dependencies.
- Extensive testing with 100% code coverage.
- Optimized for performance with O(1) lookups.
- Customizable options for flexibility.

## Install
```
npm i iplim
```

## Usage
```js
const iplim = require("iplim")

app.use(iplim({ /* options */ }))
```

### Options
> If you omit parameters, they will be set to their defaults as shown below. These are also documented in the middleware's code.

```js
timeout = 1000 * 60, //milliseconds of timeout when limit is exceeded
limit = 15,//number of requests allowed within the window
window = 1000 * 60, //milliseconds of the window for counting requests
exclude = [], //array of paths to exclude from rate limiting
statusCode = 429, //HTTP status code to send when rate limit is exceeded
message = "Too many requests", //message to send when rate limit is exceeded
verbose = false, //whether to log detailed information about requests and rate limiting decisions
```

### Static content
You probably would not want to limit requests to your static views.

- If you are using `express.static` to serve them, this is fine. It will not be affected by the middleware.

- If you are specifying a route for each view (ex: `app.get("/hey", (req, res) => res.sendFile("hey.html"))`), you MUST exclude them from the limiter by providing the exclude array as an option (ex: `exclude: ["/hey"]`).

## Disclaimer
This is for educational purposes only. I am not responsible for any damage caused by this tool.

## License
GPLv3 © dxxxxy