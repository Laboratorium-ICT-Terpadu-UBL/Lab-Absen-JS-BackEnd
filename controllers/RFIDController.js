import sqlQuery from "../config/sqlQuery.js"

export const RFIDPost = async (req, res) => {
    const { name, no_serial } = req.body

    // const currentDate = Date.now()

    if (!name || !no_serial) {
        res.status(400).json({
            error: 'Bad Request: some key not appears'
        })
        return
    }

    try {
        await sqlQuery("INSERT INTO perangkat (nama_perangkat, no_serial) VALUES (?,?)", [name, no_serial])
        res.status(200).json({
            message: `${no_serial} Devices has been added`
        })
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({
                error: `Device with ${no_serial} already exists.`
            })
        } else {
            res.status(500).json({
                error: 'Internal Server Error'
            })
        }
    }

    //in here add new RFID devices
}
export const RFIDPut = async (req, res) => {
    //in here edit or turn RFID devices 
    const { name, no_serial } = req.body

    if (!name || !no_serial) {
        res.status(400).json({
            error: 'Bad Request: some key not appears'
        })
        return
    }

    try {
        const { data } = await sqlQuery('SELECT no_serial FROM perangkat WHERE no_serial=?', [no_serial])
        if (!data[0]) {
            res.status(200).json({
                error: 'Device Not Found'
            })
            return
        }

        await sqlQuery('UPDATE perangkat SET nama_perangkat=? WHERE no_serial=?', [name, no_serial])
        res.status(200).json({
            message: `${no_serial} Device Updated`
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        })
    }

}

export const RFIDEnrollPut = async (req, res) => {
    const { enroll, no_serial } = req.body

    if (!enroll || !no_serial) {
        res.status(400).json({
            error: 'Bad Request: some key not appears'
        })
        return
    }

    const enrollBool = enroll === "1" ? 1 : 0

    try {
        const { data } = await sqlQuery('SELECT no_serial FROM perangkat WHERE no_serial=?', [no_serial])
        if (!data[0]) {
            res.status(200).json({
                error: 'Device Not Found'
            })
            return
        }

        await sqlQuery('UPDATE perangkat SET enroll=? WHERE no_serial=?', [enrollBool, no_serial])
        res.status(200).json({
            message: `${no_serial} Device Updated`
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        })
    }
}
export const RFIDDelete = async (req, res) => {
    const { no_serial } = req.body
    console.log(no_serial);

    if (!no_serial) {
        res.status(400).json({
            error: 'Bad Request: some key not appears'
        })
        return
    }

    try {
        const { data } = await sqlQuery('SELECT no_serial FROM perangkat WHERE no_serial=?', [no_serial])
        if (!data[0]) {
            res.status(200).json({
                error: 'Device Not Found'
            })
            return
        }

        await sqlQuery('DELETE FROM perangkat WHERE no_serial=?', [no_serial])
        res.status(200).json({
            message: `${no_serial} Device Deleted`
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        })
    }
    //in here delete RFID devices
}
export const RFIDGet = async (req, res) => {
    //in here get all RFID devices

    try {
        const { data } = await sqlQuery('SELECT * FROM perangkat')

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