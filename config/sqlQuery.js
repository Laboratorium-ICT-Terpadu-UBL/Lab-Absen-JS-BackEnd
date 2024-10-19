import conn from "./db_mysql.js";

export default (query, value = []) => new Promise((resolve, reject) => {
    conn.query(query, value, (error, results, field) => {
        if (error) {
            reject(error)
            return
        }
        resolve({ data: results, fields: field })
    })
})