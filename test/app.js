const express = require("express")
const app = express()
const iplim = require("../index")

app.use(iplim({ timeout: 1000 * 10 * 15, limit: 15, exclude: ["/hey"], log: true }))

app.get("/", (req, res) => res.send("Hello World!"))

app.get("/hey", (req, res) => res.send("Hello World!2"))

app.listen(3000)