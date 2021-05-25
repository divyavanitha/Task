const jwt = require('jsonwebtoken');
const fs = require("fs");
const multer = require('multer');

function auth(req, res, next) {
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

function upload(destinationPath) {
    console.log(destinationPath);
    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
    }

    let storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, destinationPath);
        },
        filename: function (req, file, cb) {
            cb(null, Date.now().toString() + '_' + file.originalname);
        }
    });

    let uploaded = multer({ storage: storage, limits: { fileSize: (5000 * 1024) } });
    return uploaded;
}

module.exports = { upload: upload, auth: auth };