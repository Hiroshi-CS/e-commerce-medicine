const crypto = require("crypto");

const base64Convert = require("./base64uRL.JS");

// Create token
const createJWToken = function (user) {
    // jwt token secret
    const jwtSecret = process.env.JWT_TOKEN_SECRET;

    // Set up header & payload
    const header = {
        type: "JWT",
        alg: "SHA256",
    };

    const payload = {
        email: user.email,
        role: user.role_id,
        userId: user._id,
        userName: user.fullName,
        exp: Date.now() + 60 * 60 * 1000,
    };

    // Encode header and payload
    const encodeHeader = base64Convert.base64UrlEncode(JSON.stringify(header));
    const encodePayload = base64Convert.base64UrlEncode(JSON.stringify(payload));

    // Create token data
    const tokenData = `${encodeHeader}.${encodePayload}`;

    // Create signature
    const signature = crypto.createHmac("sha256", jwtSecret).update(tokenData).digest("base64url");

    // Create token
    const JWToken = `${tokenData}.${signature}`;

    return JWToken;
};

// Verify token
const verifyToken = function (token) {
    if (!token) {
        return null;
    }
    const [header, payload, signature] = token.split(".");

    const payloadDecode = JSON.parse(base64Convert.base64UrlDecode(payload));

    // Create token data
    const tokenData = `${header}.${payload}`;

    // Create signature
    const jwtSecret = process.env.JWT_TOKEN_SECRET;

    const signatureCheck = crypto
        .createHmac("sha256", jwtSecret)
        .update(tokenData)
        .digest("base64url");

    if (signatureCheck == signature && Date.now() <= payloadDecode.exp) {
        return payloadDecode;
    }

    return null;
};

module.exports = {
    createJWToken,
    verifyToken,
};
