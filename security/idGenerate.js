import { nanoid } from "nanoid";

export default (length = 10) => {
    const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const id = nanoid(length, alphanumeric);
    return id
}