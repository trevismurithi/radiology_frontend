/**
 *
 * @param {Number} num
 * @returns {Array}
 */
function usePassword(num = 7) {
    return [
        (val) => !!val || 'field is required',
        (val) => (!!val && val.length > num) || `not minimum than ${num}`,
        (val) => /[A-Z]/.test(val) || 'must have capital letter',
        (val) => /\W/.test(val) || 'at least one special character',
        (val) => /\d/.test(val) || 'at least one number'
    ]
}

/**
 *
 * @param {Number} size
 * @returns {Array}
 */
function useFile(size) {
    return [
        (val) => !!val || 'file is required',
        (val) => (!!val && val.size < size) || 'file too large'
    ]
}

/**
 *
 * @returns {Array}
 */
function useEmail(min = 3, max = 255, char = 'characters') {
    return [
        (val) => !!val || 'email is required',
        (val) => /.+@.+\..+/.test(val) || 'email has the wrong format',
        (val) => (!!val && val.length > min) || `minimum ${char} ${min + 1}`,
        (val) => (!!val && val.length < max) || `maximum ${char} reached of ${max}`
    ]
}

/**
 *
 * @param {Number} num - minimu required num
 * @returns {Array}
 */
function usePhone(num) {
    return [
        (val) => !!val || 'number is required',
        (val) => (!!val && val.substring(0, 3) === '254') || 'must start with 254',
        (val) => !/[^A-Za-z0-9]/.test(val) || 'remove special characters and spaces',
        (val) => (!!val && val.length === num) || `${num} digits required`
    ]
}

/**
 *
 * @param {Number} min - minimum value
 * @param {Number} max - maximum value
 * @returns {Array}
 */
function useText(min, max, char = 'characters') {
    return [
        (val) => !!val || 'field is required',
        // val => !/[^A-Za-z0-9\s]/.test(val) || 'remove special characters',
        (val) => (!!val && val.length > min) || `minimum ${char} ${min + 1}`,
        (val) => (!!val && val.length < max) || `maximum ${char} reached of ${max}`
    ]
}

/**
 *
 * @returns {Array}
 */
function useRequired() {
    return [
        (val) => !!val || 'field is required'
    ]
}

/**
 *
 * @param {Number} num - required minimum digits
 * @returns {Array}
 */
function usePin(num) {
    return [
        (val) => !!val || 'pin is required',
        (val) => (!!val && val.length === num) || `required ${num} characters`,
        (val) => /^[A-Za-z]/.test(val) || 'wrong information format',
        (val) => !/\W/.test(val) || 'remove special characters',
        (val) => /\d+/.test(val) || 'invalid input'
    ]
}

/**
 *
 * @param {Number} limit - value limit
 * @param {Number} limit - value limit
 * @returns {Array}
 */
function useLimiter(min, max) {
    return [
        (val) => !!val || 'value is required',
        (val) => !/[^0-9]/.test(val) || 'remove special characters',
        (val) => (!!val && Number(val) >= Number(min)) || `minimum value is ${min}`,
        (val) => (!!val && Number(val) <= Number(max)) || `maximum value is ${max}`
    ]
}

export {
    useEmail,
    usePhone,
    useText,
    useRequired,
    usePin,
    useLimiter,
    usePassword,
    useFile
}
