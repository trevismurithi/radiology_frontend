import { useChecker } from "./utils"
export function orderByField (key, data, reverse) {
    if (reverse) {
        return data.sort((a,b)=> useChecker(a[key]).localeCompare(useChecker(b[key])))
    }
    return data.sort((a,b)=> useChecker(b[key]).localeCompare(useChecker(a[key])))
}