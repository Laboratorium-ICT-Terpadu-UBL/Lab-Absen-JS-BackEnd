import sqlQuery from "../config/sqlQuery.js"
import { calDateDiff, isoDateFormater } from "../utilities/dateFormatter.js"
import getCurrDateTime from "../utilities/getCurrDateTime.js"

export const leavePost = async (req, res) => {
    //in here when add new leave assistant
    const { nim, info, dateS, dateE } = req.body

    if (!nim || !info || !dateS || !dateE) {
        res.status(400).json({
            error: 'Bad Request: some key not appears'
        })
        return
    }

    let assistant_data = []

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
        const { data } = await sqlQuery(`SELECT nim FROM asisten 
        WHERE nim IN (?)
        AND status='Aktif'
        AND NOT EXISTS (SELECT 1 FROM izin
            WHERE  izin.nim=asisten.nim
            AND izin.tanggal_izin BETWEEN ? AND ? )
        AND NOT EXISTS (
            SELECT 1
            FROM presensi
            WHERE presensi.nim = asisten.nim
            AND presensi.tanggal_presensi BETWEEN ? AND ?
        )`, [assistant_data, dateS, dateE, dateS, dateE])

        const diffArr = assistant_data.filter(value => !data.some(sqlData => sqlData.nim === value.toString()))

        if (diffArr.length > 0) {
            const usersnotFound = diffArr.join(',');
            res.status(404).json({
                error: `User ${usersnotFound}  Not Found or Already In`
            })
            return
        }

        const diffDays = calDateDiff(dateS, dateE)
        const value = []

        assistant_data.forEach((item) => {
            for (let i = 0; i <= diffDays; i++) {
                const date1 = new Date(dateS)
                const currentDate = new Date(date1);
                currentDate.setDate(date1.getDate() + i);
                const formattedDate = isoDateFormater(currentDate.toISOString())
                value.push([item, info, formattedDate]);
            }
        })

        //need fix?
        await sqlQuery(`INSERT INTO IZIN (nim, keterangan, tanggal_izin) VALUES ?`, [value])
        res.status(200).json({
            message: `${nim} Succes Leave`
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        })
    }

}
export const leavePut = async (req, res) => {
    //in here when edit leave assistant
    const { nim, date, info } = req.body


    if (!nim || !date || !info) {
        res.status(400).json({
            error: 'Bad Request: some key not appears'
        })
        return
    }

    try {
        const { data = [] } = await sqlQuery(`SELECT nim FROM izin 
        WHERE nim=? AND tanggal_izin=?`, [nim, date])
        if (data.length <= 0) {
            res.status(404).json({
                error: `User ${nim}  Not Found or Not Leave`
            })
            return
        }

        await sqlQuery(`UPDATE izin SET keterangan=? WHERE nim=? AND tanggal_izin=?`, [info, nim, date])
        res.status(200).json({
            message: `${nim} Leave Updated`
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        })
        return
    }
}
export const leaveDelete = async (req, res) => {
    //in here when delete leave assistant
    //array
    const { nim, date } = req.body
    let assistant_nim = []

    if (!nim || !date) {
        res.status(400).json({
            error: 'Bad Request: some key not appears'
        })
        return
    }

    try {
        assistant_nim = JSON.parse(nim)
        if (typeof assistant_nim !== 'object') {
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
        const { data = [] } = await sqlQuery(`SELECT nim FROM izin 
        WHERE nim IN (?) AND tanggal_izin=?`, [assistant_nim, date])
        if (data.length !== assistant_nim.length) {
            res.status(404).json({
                error: `Some NIM  Not Found`
            })
            return
        }

        await sqlQuery(`DELETE FROM izin 
        WHERE nim IN (?) AND tanggal_izin=?`, [assistant_nim, date])
        res.status(200).json({
            message: `${nim} Succes Leave`
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        })
        return
    }

}
export const leaveGet = async (req, res) => {
    //in here when get all leave assistant
    const { date } = req.query
    const { formattedDate } = getCurrDateTime()

    try {
        const { data = [] } = await sqlQuery(`SELECT asisten.nim, izin1.keterangan, izin1.tanggal_izin, asisten.nama, asisten.jabatan 
        FROM asisten
        INNER JOIN izin izin1 ON asisten.nim = izin1.nim
        WHERE izin1.tanggal_izin = ? AND asisten.status = 'Aktif'
        UNION
        SELECT asisten.nim, izin2.keterangan, izin2.tanggal_izin, asisten.nama, asisten.jabatan 
        FROM asisten
        LEFT JOIN izin izin2 ON asisten.nim = izin2.nim AND izin2.tanggal_izin = ?
        WHERE asisten.status = 'Aktif' AND izin2.nim IS NULL
        AND NOT EXISTS (
            SELECT 1
            FROM presensi
            WHERE asisten.nim = presensi.nim
            AND presensi.tanggal_presensi=?
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