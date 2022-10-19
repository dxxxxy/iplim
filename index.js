module.exports = options => {
    //map initialization
    const ips = new Map()

    return (req, res, next) => {
        //check if path is in exclude
        if (options.exclude.includes(req.path)) next()

        //increment ip count
        ips.set(req.ip, (ips.get(req.ip) || 0) + 1)

        //check if ip count is greater than limit
        if (ips.get(req.ip) >= options.limit) {
            res.status(429).send("Too many requests")

            //clear ip count after cooldown
            setTimeout(() => ips.delete(req.ip), options.cooldown)
        } else next() //continue the request
    }
}