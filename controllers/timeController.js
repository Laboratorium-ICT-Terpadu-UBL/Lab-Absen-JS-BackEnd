export default (req, res) => {
    const currentDate = Date.now()

    res.status(200).json({
        data: currentDate
    })
}