import { describe, test, expect, vi } from "vitest"
import iplim from "../index.js"

const config = { timeout: 2000, limit: 2, window: 1000, exclude: ["/exclude"], statusCode: 429, message: "Too many requests", verbose: true }

describe("iplim - Rate Limiter Middleware for Express.js", () => {
    test("should use req.connection.remoteAddress if req.ip is missing", () => {
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
        const req = { connection: { remoteAddress: "192.168.1.1" }, path: "/" }
        const next = vi.fn()
        const middleware = iplim(config)

        middleware(req, res, next)

        expect(next).toHaveBeenCalledTimes(1)
    })

    test("should use 'unknown' if req.ip and req.connection.remoteAddress are missing", () => {
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
        const req = { path: "/" }
        const next = vi.fn()
        const middleware = iplim(config)

        middleware(req, res, next)

        expect(next).toHaveBeenCalledTimes(1)
    })

    test("should allow requests with path exclusion", () => {
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
        const req = { ip: "0.0.0.0", path: "/exclude" }
        const next = vi.fn()
        const middleware = iplim(config)

        //call thrice but since the path is excluded, all should pass
        middleware(req, res, next)
        middleware(req, res, next)
        middleware(req, res, next)

        expect(res.status).not.toHaveBeenCalled()
        expect(res.json).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledTimes(3)
    })

    test("should allow requests under the limit", () => {
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
        const req = { ip: "0.0.0.0", path: "/" }
        const next = vi.fn()
        const middleware = iplim(config)

        //call twice which is the limit, so both should pass
        middleware(req, res, next)
        middleware(req, res, next)

        expect(res.status).not.toHaveBeenCalled()
        expect(res.json).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledTimes(2)
    })

    test("should allow requests after window resets", () => {
        vi.useFakeTimers()
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
        const req = { ip: "0.0.0.0", path: "/" }
        const next = vi.fn()
        const middleware = iplim(config)

        //call twice which is the limit, so both should pass
        middleware(req, res, next)
        middleware(req, res, next)

        expect(res.status).not.toHaveBeenCalled()
        expect(res.json).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledTimes(2)

        //wait for the window to reset (1000ms) and then call again, which should pass since the window cleared
        vi.advanceTimersByTime(config.window)
        middleware(req, res, next)

        expect(res.status).not.toHaveBeenCalled()
        expect(res.json).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledTimes(3)
        vi.useRealTimers()
    })

    test("should reject requests over the limit and allow after timeout", () => {
        vi.useFakeTimers()
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
        const req = { ip: "0.0.0.0", path: "/" }
        const next = vi.fn()
        const middleware = iplim(config)

        //call thrice which exceeds the limit, so the first two should pass and the third should be blocked
        middleware(req, res, next)
        middleware(req, res, next)
        middleware(req, res, next)

        expect(res.status).toHaveBeenCalledWith(config.statusCode)
        expect(res.json).toHaveBeenCalledWith({ message: config.message })
        expect(next).toHaveBeenCalledTimes(2)

        //call again while in timeout, which should still be blocked
        middleware(req, res, next)

        //wait for the timeout to clear (2000ms) and then call again, which should pass since the timeout cleared
        vi.advanceTimersByTime(config.timeout)
        middleware(req, res, next)

        expect(next).toHaveBeenCalledTimes(3)
        vi.useRealTimers()
    })
})