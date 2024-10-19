const facultySW = (majorString) => {
    switch (majorString) {
        case "Managemen":
            return "Fakultas Ekonomi"
        case "Akuntansi":
            return "Fakultas Ekonomi"
        case "3":
            return "Fakultas Teknologi Informasi"
        case "4":
            return "Fakultas Teknologi Informasi"
        case "5":
            return "Fakultas Teknologi Informasi"
        default:
            return ""
    }
}

const majorSW = (stringNum) => {
    switch (stringNum) {
        case "31":
            return "Managemen"
        case "32":
            return "Akuntansi"
        case "11":
            return "Teknik Informatika"
        case "12":
            return "Sistem Informasi"
        case "13":
            return "Sistem Komputer"
        default:
            return ""
    }
}

export default (nim) => {
    const year = nim.substring(0, 2);
    const major = majorSW(nim.substring(4, 6));
    const faculty = facultySW(major)

    return { year, faculty, major }
}