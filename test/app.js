const express = require("express")
const app = express()
const iplim = require("../index")

app.use(express.static("public"))
app.use(iplim({
    window: 1000 * 10,
    timeout: 1000 * 30,
    exclude: ["/hey"],
    verbose: true
}))

app.get("/hey", (req, res) => res.send("Hello World!")) //not limited
app.get("/hey2", (req, res) => res.send("Hello World!")) //limited

app.listen(3000)