const admin = require('../firebase')
const jwt = require('jsonwebtoken');



const mixMiddleware = async (req, res, next) => {
    // combine both google auth and jwt  

    const authH = req.get('Authorization');
    if (!authH) {
        const error = new Error('NOT AUTHENTICATICED USER');
        error.statusCode = 401;
        throw error;
    }
    const token = authH.split(' ')[1];
    let decodeToken;
    let decodeValue;
    try {
        //jwt 
        decodeToken = jwt.verify(token, 'sfcdhbvdhs vsdvjsvsvvd')
        console.log(decodeToken)
    } catch (err) {
        try {
            //firebase auth admin
            decodeValue = await admin.auth().verifyIdToken(token);
            console.log(decodeValue)
            if (decodeValue) {
                return next()
            }
            return res.json({ message: "un Authorization by users" })

        } catch (err) {
            console.log("error for admin google", err.message)
        }
        err.statusCode = 500;
        throw err;
    }
    if (!decodeToken) {
        const error = new Error("not allowed for jwt  ");
        error.statusCode = 401;
        throw error
    }
    
    req.userId = decodeToken.userId
    next();

}



const Authmiddleware = (req, res, next) => {
    const authH = req.get('Authorization');
    if (!authH) {
        const error = new Error('NOT AUTHENTICATICED');
        error.statusCode = 401;
        throw error;
    }
    const token = authH.split(' ')[1];
    let decodeToken;
    let decodeValue;
    try {
        decodeToken = jwt.verify(token, 'sfcdhbvdhs vsdvjsvsvvd')
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodeToken) {
        const error = new Error("not allowed ");
        error.statusCode = 401;
        throw error
    }
    req.userId = decodeToken.userId
    next();
}

module.exports = {
    mixMiddleware,
    Authmiddleware
}