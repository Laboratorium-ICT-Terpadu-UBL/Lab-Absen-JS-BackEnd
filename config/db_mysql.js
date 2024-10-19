import { createConnection } from "mysql";

const conn = createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'presensi_asisten',
    port: 3306
})

conn.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
})

export default conn

