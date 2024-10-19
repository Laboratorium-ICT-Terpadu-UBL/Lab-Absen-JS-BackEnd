import { wsBroadcastdMsg } from "../bin/webSocketServer.js"
import sqlQuery from "../config/sqlQuery.js"
import getCurrDateTime from "../utilities/getCurrDateTime.js"

const attendanceFetch = async (serialCard, res) => {
    const { formattedDate, formattedTime } = getCurrDateTime()

    try {

        const { data: checkData1 } = await sqlQuery(`SELECT nim FROM asisten WHERE serial_kartu=?`, [serialCard])

        if (checkData1.length <= 0) {
            res.status(404).json({
                error: `User with Serial Card ${serialCard}  Not Found`
            })
            return
        }

        const nim = checkData1[0].nim

        const { data = [] } = await sqlQuery(`SELECT nim FROM asisten 
         WHERE nim=?
         AND status='Aktif'
         AND NOT EXISTS (SELECT 1 FROM presensi
         WHERE presensi.nim = asisten.nim
         AND presensi.tanggal_presensi = ?)
         AND NOT EXISTS (SELECT 1 FROM izin WHERE izin.nim = asisten.nim AND izin.tanggal_izin =?)`,
            [nim, formattedDate, formattedDate])

        if (data.length > 0) {
            // attendance out
            await sqlQuery(`INSERT INTO 
            presensi (tanggal_presensi, nim, waktu_datang)
            VALUES (?,?,?)`, [formattedDate, nim, formattedTime])

            wsBroadcastdMsg({
                update: true

            })

            res.status(200).json({
                message: `${nim} Attendance In Inputed`
            })
            return

        }
        await sqlQuery(`UPDATE presensi 
        SET waktu_pulang=?
        WHERE nim=?
        AND tanggal_presensi=?`, [formattedTime, nim, formattedDate])

        wsBroadcastdMsg({
            update: true

        })
        
        res.status(200).json({
            message: `${nim} Attendance Out Inputed`
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        })
    }

}

export default async (req, res) => {
    //in here when RFID fetch URL.
    //if in sql, device is attend than execute and send success msg to ws
    //if in sql, device is enroll than send serial card to client

    const { serialCard, macDevice } = req.body

    if (!serialCard || !macDevice) {
        res.status(400).json({
            error: 'Bad Request: some key not appears'
        })
        return
    }

    try {

        const { data: checkData2 } = await sqlQuery(`SELECT enroll FROM perangkat WHERE no_serial=?`, [macDevice])

        if (checkData2.length <= 0) {
            res.status(200).json({
                error: `Device with Serial Number ${macDevice}  Not Found`
            })
            return
        }

        if (checkData2[0].enroll === 1) {
            wsBroadcastdMsg({
                data: {
                    deviceSerial: macDevice,
                    card_no: serialCard
                },
                update: false

            })
            res.status(200).json({
                message: `Serial Card Sended ${serialCard}`
            })
            return
        }
        await attendanceFetch(serialCard, res)


    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        })
    }

}