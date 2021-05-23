const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
    let token = req.header("Authorization");
    if (token && token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }
    if(!token) res.status(401).send('Access Denied');

    try {
        const decoded = jwt.verify(token, 'secret');
        req.user = decoded;

        next();
    } catch (e) {
        res.status(400).send('Invalid token');
    }
}

