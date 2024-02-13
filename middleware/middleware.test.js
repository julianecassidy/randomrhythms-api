"use strict";

const jwt = require("jsonwebtoken");

const { authenticateJWT, ensureLoggedIn } = require("./middleware");

const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../helpers/expressError");
const testJwt = jwt.sign({ id: 1, name: "Test", email: "test@test.com" }, SECRET_KEY);
const badJwt = jwt.sign({ id: 1, name: "Test", email: "test@test.com" }, "wrong");

function next(err) {
  if (err) throw new Error("Got error from middleware");
}

describe("authenticateJWT", function () {
  test("works: via header", function () {
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        id: expect.any(Number),
        name: "Test",
        email: "test@test.com",
      },
    });
  });

  test("works: no header", function () {
    const req = {};
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});


describe("ensureLoggedIn", function () {
  test("works", function () {
    const req = {};
    const res = {
      locals:
        { user: { id: 1, name: "Test", email: "test@test.com" } }
    };
    ensureLoggedIn(req, res, next);
  });

  test("throws 401 if no login", function () {
    const req = {};
    const res = { locals: {} };
    expect(() => ensureLoggedIn(req, res, next)).toThrow(UnauthorizedError);
  });

  test("throws 401 if no valid login", function () {
    const req = {};
    const res = { locals: { user: {} } };
    expect(() => ensureLoggedIn(req, res, next)).toThrow(UnauthorizedError);
  });
});