import sqlQuery from "../config/sqlQuery.js"
import { Bhash } from "../security/bcryptPassword.js"
import nimConverter from "../utilities/nimConverter.js"

export const assistantPost = async (req, res) => {
    //in here when add new assistant
    const { nim, name, phone, gender, card_no, password, position } = req.body

    if (!nim || !name || !phone || !gender || !position) {
        res.status(400).json({
            error: 'Bad Request: some key not appears'
        })
        return
    }

    if (gender !== "Laki-laki" && gender !== "Perempuan") {
        res.status(400).json({
            error: 'Bad Request: genders must "Laki-laki"  or "Perempuan"'
        })
        return
    }

    if (position !== "Calon Asisten" && position !== "Asisten" && position !== "Supervisor") {
        res.status(400).json({
            error: 'Bad Request: position must "Calon Asisten" or "Asisten" or "Supervisor"'
        })
        return
    }

    const { faculty, major } = nimConverter(nim)
    const hashedPassword = await Bhash(password)
    try {
        await sqlQuery("INSERT INTO asisten (nim, nama, fakultas, jurusan, jenis_kelamin, no_telp, jabatan, kata_sandi, status, serial_kartu) VALUES (?,?,?,?,?,?,?,?,?,?)",
            [nim, name, faculty, major, gender, phone, position, password !== "" ? hashedPassword : null, "Aktif", card_no !== "" ? card_no : null])
        res.status(200).json({
            message: `${nim} User has been added`
        })
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({
                error: `NIM with ${id} already exists.`
            })
        } else {
            res.status(500).json({
                error: 'Internal Server Error'
            })
        }
    }
}
export const assistantPut = async (req, res) => {
    //in here when edit assistant
    const { nim, name, phone, gender, card_no, password, position } = req.body
    if (!nim || !name || !phone || !gender || card_no === undefined || password === undefined || !position) {
        res.status(400).json({
            error: 'Bad Request: some key not appears'
        })
        return
    }

    try {
        const { data = [] } = await sqlQuery(`SELECT nim FROM asisten 
        WHERE nim=?`, [nim])
        if (data.length <= 0) {
            res.status(404).json({
                error: `User ${nim}  Not Found`
            })
            return
        }

        const hashedPassword = password !== "" ? await Bhash(password) : null

        await sqlQuery(`UPDATE asisten SET nama=?, jenis_kelamin=?, no_telp=?, jabatan=?, serial_kartu=? ${password !== "" ? `, kata_sandi='${hashedPassword}'` : ''}  WHERE nim=?`,
            [name, gender, phone, position, card_no, nim])
        res.status(200).json({
            message: `${nim} User Updated`
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        })
        return
    }

}
export const assistantPutDisableEnable = async (req, res) => {
    //array
    //in here when edit assistant
    const { nim, status } = req.body
    let assistant_data = []

    if (!nim || !status) {
        res.status(400).json({
            error: 'Bad Request: some key not appears'
        })
        return
    }

    try {
        assistant_data = JSON.parse(nim)
        if (typeof assistant_data !== 'object') {
            res.status(400).json({
                error: 'Bad Request: string is not object value'
            })
            return
        }
    } catch (error) {
        res.status(400).json({
            error: 'Bad Request: string is not object value'
        })
        return
    }

    if (status !== "Aktif" && status !== "Tidak aktif") {
        res.status(400).json({
            error: 'Bad Request: status must "Aktif" or "Tidak aktif"'
        })
        return
    }

    try {
        const { data = [] } = await sqlQuery('SELECT nim FROM asisten WHERE nim IN (?)', [assistant_data])
        const diffArr = assistant_data.filter(value => !data.some(sqlData => sqlData.nim === value.toString()))

        if (diffArr.length > 0) {
            const usersnotFound = diffArr.join(',');
            res.status(404).json({
                error: `User ${usersnotFound}  Not Found `
            })
            return
        }

        await sqlQuery(`UPDATE asisten SET status=? WHERE nim IN (?)`, [status, assistant_data])
        const successNim = assistant_data.join(',')
        res.status(200).json({
            message: `${successNim} Status Updated to ${status}`
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        })
    }


}
export const assistantDelete = async (req, res) => {
    //array
    //in here when delete assistant

    const { nim } = req.body
    let assistant_data = []

    if (!nim) {
        res.status(400).json({
            error: 'Bad Request: some key not appears'
        })
        return
    }

    try {
        assistant_data = JSON.parse(nim)
        if (typeof assistant_data !== 'object') {
            res.status(400).json({
                error: 'Bad Request: string is not object value'
            })
            return
        }
    } catch (error) {
        res.status(400).json({
            error: 'Bad Request: string is not object value'
        })
        return
    }

    try {
        const { data = [] } = await sqlQuery('SELECT nim FROM asisten WHERE nim IN (?)', [assistant_data])
        const diffArr = assistant_data.filter(value => !data.some(sqlData => sqlData.nim === value.toString()))

        if (diffArr.length > 0) {
            const usersnotFound = diffArr.join(',');
            res.status(404).json({
                error: `User ${usersnotFound}  Not Found `
            })
            return
        }

        await sqlQuery(`DELETE FROM presensi WHERE nim IN (?)`, [assistant_data])
        await sqlQuery(`DELETE FROM asisten WHERE nim IN (?)`, [assistant_data])
        const successNim = assistant_data.join(',')
        res.status(200).json({
            message: `${successNim} Deleted`
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        })
    }

}
export const assistantGet = async (req, res) => {
    //in here when get all assistant
    try {
        const { data = [] } = await sqlQuery(`SELECT nim, nama, fakultas, jurusan, jenis_kelamin, surel, no_telp, jabatan, serial_kartu, status FROM asisten`)

        res.status(200).json({
            data
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        })
    }
}
