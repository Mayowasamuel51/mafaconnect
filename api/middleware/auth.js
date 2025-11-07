const admin = require('../firebase')

class Middleware {
    async decodeToken(req, res, next) {
        const token = req.headers.authorization.split(' ')[1];  // coming from frontend 
        try {
            const decodeValue =  await  admin.auth().verifyIdToken(token);
            console.log(decodeValue)
            if (decodeValue) {
                return next()
            }
            return res.json({ message: "un Authorization by users" })
        } catch (err) {
            return res.json({ message:err.message })
        }
    }
}

module.exports = new Middleware();