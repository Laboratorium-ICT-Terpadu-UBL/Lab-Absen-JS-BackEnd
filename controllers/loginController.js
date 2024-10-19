import sqlQuery from "../config/sqlQuery.js";
import { Bcompare } from "../security/bcryptPassword.js";
import { generateBearerToken } from "../security/jwtManger.js";

export default async (req, res) => {
    const { user, password } = req.body
    let datas = []

    //get datas from db
    try {
        const { data } = await sqlQuery(`SELECT * FROM asisten WHERE nim=?`,[user || '0'])
        datas = data
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        })
    }

    //if user not FOund
    if (!datas[0]) {
        res.status(200).json({
            error: 'User Not Found'
        })
        return
    }

    //checking Password
    if (await Bcompare(password || '0', datas[0]?.kata_sandi) === false) {
        res.status(200).json({
            error: 'Wrong Password'
        })
        return
    }

    // set cookie expire
    const currentDate = new Date();
    const expirationDate = new Date(currentDate);
    expirationDate.setHours(168, 0, 0, 0);
    // if success
    //generate token
    const { nim, nama, surel } = datas[0]
    const token = generateBearerToken({ name: nama, nim: nim, email: surel })
    // set header to client
    res.header('Access-Control-Allow-Credentials', true);
    //set cookie to client
    res.cookie('signInToken', token, {
        httpOnly: false,
        secure: false,
        expires: expirationDate,
        path: '/'
    });
    // sent to client with cookie
    res.status(200).json({
        name: nama, nim: nim, email: surel
    })
}