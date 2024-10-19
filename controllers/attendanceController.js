import sqlQuery from "../config/sqlQuery.js"
import { isoDateFormater, isoTimeFormater } from "../utilities/dateFormatter.js"
import getCurrDateTime from "../utilities/getCurrDateTime.js"

export const attendancePost = async (req, res) => {
    //in here when add new attendance
    //with array
    const { nim } = req.body  //this is string Object
    const { formattedDate, formattedTime } = getCurrDateTime()
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
        const { data = [] } = await sqlQuery(`SELECT nim FROM asisten 
        WHERE nim IN (?) 
        AND status='Aktif'
        AND NOT EXISTS (SELECT 1 FROM presensi
            WHERE presensi.nim = asisten.nim
            AND presensi.tanggal_presensi = ?)
        AND NOT EXISTS (SELECT 1 FROM izin WHERE izin.nim = asisten.nim AND izin.tanggal_izin =?)`,
            [assistant_data, formattedDate, formattedDate])
        const diffArr = assistant_data.filter(value => !data.some(sqlData => sqlData.nim === value.toString()))

        if (diffArr.length > 0) {
            const usersnotFound = diffArr.join(',');
            res.status(404).json({
                error: `User ${usersnotFound}  Not Found or Already In`
            })
            return
        }
        const values = assistant_data.map(value => [formattedDate, value, formattedTime])
        //need fix?
        await sqlQuery(`INSERT INTO 
        presensi (tanggal_presensi, nim, waktu_datang)
        VALUES ?`, [values])
        const succesNim = assistant_data.join(',');
        res.status(200).json({
            message: `${succesNim} Attendance In Inputed`
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        })
    }
}
export const attendancePut = async (req, res) => {
    //in here when assistant homeward
    //in array
    const { nim, time } = req.body
    const { formattedDate, formattedTime } = getCurrDateTime()
    let assistant_data = []
    let homewTime;

    if (!nim || !time) {
        res.status(400).json({
            error: 'Bad Request: some key not appears'
        })
        return
    }

    if (time) {
        homewTime = isoTimeFormater(time)
    } else {
        homewTime = formattedTime
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
        const { data = [] } = await sqlQuery(`SELECT nim FROM asisten 
        WHERE nim IN (?)
        AND EXISTS (SELECT 1 FROM presensi
            WHERE presensi.nim = asisten.nim
            AND presensi.tanggal_presensi = ?)`,
            [assistant_data, formattedDate])
        const diffArr = assistant_data.filter(value => !data.some(sqlData => sqlData.nim === value.toString()))

        if (diffArr.length > 0) {
            const usersnotFound = diffArr.join(',');
            res.status(404).json({
                error: `User ${usersnotFound}  Not Found or Already Out`
            })
            return
        }

        await sqlQuery(`UPDATE presensi 
        SET waktu_pulang=?
        WHERE nim IN (?)
        AND tanggal_presensi=?`, [homewTime, assistant_data, formattedDate])
        const succesNim = assistant_data.join(',');
        res.status(200).json({
            message: `${succesNim} Attendance Out Inputed`
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        })
    }
}
export const attendanceDelete = async (req, res) => {
    //in here when delete attendance
    //in array
    const { nim, date } = req.body
    let assistant_data = []

    if (!nim || !date) {
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
        const { data = [] } = await sqlQuery(`SELECT nim FROM presensi
         WHERE nim IN (?)
         AND tanggal_presensi=?`, [assistant_data, date])
        const diffArr = assistant_data.filter(value => !data.some(sqlData => sqlData.nim === value.toString()))

        if (diffArr.length > 0) {
            const usersnotFound = diffArr.join(',');
            res.status(404).json({
                error: `User ${usersnotFound}  Not Found or Deleted`
            })
            return
        }

        await sqlQuery(`DELETE FROM presensi 
        WHERE nim IN (?)
        AND tanggal_presensi=?`, [assistant_data, date])
        const succesNim = assistant_data.join(',');
        res.status(200).json({
            message: `${succesNim} Attendance Deleted`
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        })
    }
}
export const attendanceGet = async (req, res) => {
    //in here get all attendance where assistang active
    const { formattedDate } = getCurrDateTime()
    const { date } = req.query

    try {
        const { data = [] } = await sqlQuery(`SELECT asisten.nim, asisten.jabatan, asisten.nama, presensi.tanggal_presensi, presensi.waktu_datang, presensi.waktu_pulang FROM asisten
        INNER JOIN presensi ON asisten.nim = presensi.nim
        WHERE presensi.tanggal_presensi = ? AND asisten.status = 'Aktif'
        UNION
        SELECT asisten.nim, asisten.jabatan, asisten.nama, presensi.tanggal_presensi, presensi.waktu_datang, presensi.waktu_pulang FROM asisten
        LEFT JOIN presensi ON asisten.nim = presensi.nim AND presensi.tanggal_presensi = ?
        WHERE asisten.status = 'Aktif' AND presensi.nim IS NULL
        AND NOT EXISTS (
            SELECT 1 FROM izin WHERE asisten.nim = izin.nim
            AND izin.tanggal_izin = ?
        )`, [date || formattedDate, date || formattedDate, date || formattedDate])

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