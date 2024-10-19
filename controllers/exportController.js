import sqlQuery from "../config/sqlQuery.js"

export default async (req, res) => {
    //in here when client export data assistant from date
    const { dateS, dateE, position } = req.query

    if (!dateS || !dateE || !position) {
        res.status(400).json({
            error: 'Bad Request: some key not appears'
        })
        return
    }

    let assistantTime = ''
    let queryPosition = ''

    if (position === 'all') {
        queryPosition = ''
    } else if (position === 'Asisten') {
        queryPosition = 'AND a.jabatan = "Asisten" OR a.jabatan = "Supervisor"'
    } else if (position === 'Calon Asisten') {
        queryPosition = 'AND a.jabatan = "Calon Asisten"'
    } else {
        queryPosition = ''
    }

    if (position === 'Asisten') {
        assistantTime = '08:00:00'
    } else if (position === 'Calon Asisten') {
        assistantTime = '07:30:00'
    } else {
        assistantTime = '08:00:00'
    }

    try {
        const { data } = await sqlQuery(`
     SELECT 
         a.nim,
         a.nama,
         COUNT(DISTINCT i.tanggal_izin) AS jumlah_izin,
         COUNT(DISTINCT p.tanggal_presensi)AS jumlah_hadir,
         COUNT(CASE WHEN DAYNAME(p.tanggal_presensi) = 'Saturday' THEN 1 END) AS jumlah_presensi_lembur,
         COUNT(CASE WHEN p.waktu_datang < '07:30:00' THEN 1 END) AS jumlah_kedatangan_awal,
         CONCAT(
             ROUND(
                 SUM(
                     CASE 
                         WHEN p.waktu_datang > ? THEN 
                             TIME_TO_SEC(TIMEDIFF(p.waktu_datang, ?)) / 60
                         ELSE 
                             0 
                     END
                 )
             ),
             ' Menit'
         ) AS jumlah_keterlambatan
     FROM 
         asisten a
     LEFT JOIN 
         izin i ON a.nim = i.nim AND i.tanggal_izin BETWEEN ? AND ?
     LEFT JOIN 
         presensi p ON a.nim = p.nim AND p.tanggal_presensi BETWEEN ? AND ?
     WHERE
         a.status = 'aktif' ${queryPosition}
     GROUP BY 
         a.nim, a.nama;
     `, [assistantTime, assistantTime, dateS, dateE, dateS, dateE])

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