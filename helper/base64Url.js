const base64UrlEncode = (str) => {
    return Buffer.from(str, "utf-8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\=/g, "")
        .replace(/\//g, "_");
};

const base64UrlDecode = (str) => {
    const base64String = str.replace(/\-/g, "+").replace(/\_/g, "/");

    return Buffer.from(base64String, "base64").toString("utf-8");
};

module.exports = {
    base64UrlEncode,
    base64UrlDecode,
};
