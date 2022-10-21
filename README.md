# iplim
Really simple and lightweight ip rate limiter for express.

## Install
```
npm i iplim
```

## Usage
```js
const iplim = require("iplim")

app.use(iplim({ timeout: 1000 * 10 * 15, limit: 15, exclude: ["/hey"], log: true }))
```