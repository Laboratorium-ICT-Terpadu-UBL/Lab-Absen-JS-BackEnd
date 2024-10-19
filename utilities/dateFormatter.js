export const calDateDiff = (isoDate1, isodate2) => {
    const date1 = new Date(isoDate1);
    const date2 = new Date(isodate2);

    const diffInDays = Math.ceil((date2 - date1) / (1000 * 60 * 60 * 24));

    return diffInDays

}

export const isoDateFormater = (isoDate) => {
    const currentDate = new Date(isoDate);
    const formattedDate = currentDate.toISOString().slice(0, 10);

    return formattedDate
}

export const isoTimeFormater = (isoTime) => {
    const currentTime = new Date(isoTime)

    const hours = String(currentTime.getHours()).padStart(2, "0");
    const minutes = String(currentTime.getMinutes()).padStart(2, "0");
    const seconds = String(currentTime.getSeconds()).padStart(2, "0");
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    return formattedTime
}