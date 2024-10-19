import { verifyBearerToken } from "../jwtManger.js";

export default (req) => {
    const token = req.cookies.signInToken;
    if (!token) {
        throw { code: 401, message: 'Token is missing' }
    }
    const acceptableToken = verifyBearerToken(token)
    if (!acceptableToken) {
        throw { code: 403, message: 'Token is not valid' }
    }

};