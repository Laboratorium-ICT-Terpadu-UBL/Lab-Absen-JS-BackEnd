export default (req) => {
    const dataObject = req.body
    Object.keys(dataObject).forEach((key, index) => {
        if (!dataObject[key] && dataObject[key] !== "") {
            throw { code: 400, message: "Bad Request" };
        }
        if (typeof dataObject[key] !== 'string') {
            throw { code: 400, message: `'${key}' is not string type` }
        }
    })
}