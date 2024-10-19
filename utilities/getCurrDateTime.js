export default (UTC=7) => {
    const curDateTime = new Date()

    const year = curDateTime.getUTCFullYear()
    const month = String(curDateTime.getUTCMonth() + 1).padStart(2, "0");
    const day = String(curDateTime.getUTCDate()).padStart(2, "0");

    const hours = String(curDateTime.getUTCHours()+UTC).padStart(2, "0");
    const minutes = String(curDateTime.getUTCMinutes()).padStart(2, "0");
    const seconds = String(curDateTime.getUTCSeconds()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    return { formattedDate, formattedTime }
}