import { describe, test, expect, vi } from "vitest"
import iplim from "../index.js"

const config = { limit: 2, window: 1000, timeout: 2000, exclude: ["/exclude"], verbose: true }

describe("iplim - Rate Limiter Middleware for Express.js", () => {
    test("should skip requests with path exclusion", () => {
        const next = vi.fn()
        const res = { status: vi.fn().mockReturnThis(), send: vi.fn() }
        const req = { ip: "0.0.0.0", path: "/exclude/test" }
        const middleware = iplim(config)

        //call thrice but since the path is excluded, all should pass
        middleware(req, res, next)
        middleware(req, res, next)
        middleware(req, res, next)

        expect(next).toHaveBeenCalledTimes(3)
        expect(res.status).not.toHaveBeenCalled()
        expect(res.send).not.toHaveBeenCalled()
    })

    test("should allow requests under the limit", () => {
        const next = vi.fn()
        const res = { status: vi.fn().mockReturnThis(), send: vi.fn() }
        const req = { ip: "0.0.0.0", path: "/" }
        const middleware = iplim(config)

        //call twice which is the limit, so both should pass
        middleware(req, res, next)
        middleware(req, res, next)

        expect(next).toHaveBeenCalledTimes(2)
        expect(res.status).not.toHaveBeenCalled()
        expect(res.send).not.toHaveBeenCalled()
    })

    test("should allow more requests after window resets", () => {
        vi.useFakeTimers()
        const next = vi.fn()
        const res = { status: vi.fn().mockReturnThis(), send: vi.fn() }
        const req = { ip: "0.0.0.0", path: "/" }
        const middleware = iplim(config)

        //call twice which is the limit, so both should pass
        middleware(req, res, next)
        middleware(req, res, next)

        expect(next).toHaveBeenCalledTimes(2)
        expect(res.status).not.toHaveBeenCalled()
        expect(res.send).not.toHaveBeenCalled()

        //wait for the window to reset (1000ms) and then call again, which should pass since the window cleared
        vi.advanceTimersByTime(1000)
        middleware(req, res, next)

        expect(next).toHaveBeenCalledTimes(3)
        expect(res.status).not.toHaveBeenCalled()
        expect(res.send).not.toHaveBeenCalled()
        vi.useRealTimers()
    })

    test("should block requests over the limit and then allow after timeout", () => {
        vi.useFakeTimers()
        const next = vi.fn()
        const res = { status: vi.fn().mockReturnThis(), send: vi.fn() }
        const req = { ip: "0.0.0.0", path: "/" }
        const middleware = iplim(config)

        //call thrice which exceeds the limit, so the first two should pass and the third should be blocked
        middleware(req, res, next)
        middleware(req, res, next)
        middleware(req, res, next)

        expect(next).toHaveBeenCalledTimes(2)
        expect(res.status).toHaveBeenCalledWith(429)
        expect(res.send).toHaveBeenCalledWith("Too many requests")

        //call again while in timeout, which should still be blocked
        middleware(req, res, next)

        //wait for the timeout to clear (2000ms) and then call again, which should pass since the timeout cleared
        vi.advanceTimersByTime(2000)
        middleware(req, res, next)

        expect(next).toHaveBeenCalledTimes(3)
        vi.useRealTimers()
    })
})