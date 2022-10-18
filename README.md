# iplim
Really simple and lightweight ip rate limiter for express.

## Install
```
npm i iplim
```

## Usage
```js
const iplim = require("iplim")

app.use(iplim({ cooldown: 10000, limit: 5 }))
```