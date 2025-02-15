export const DateMonth :{[key: number]: string} = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "Sep",
    10: "October",
    11: "Nov",
    12: "December"
}

export const PHONE_EXP =
 /^(?:\+84|0)(?:3\d{8}|5\d{8}|7\d{8}|8\d{8}|9\d{8}|2\d{9})$|^$/;


export const Roles: {[key: number]: string} = {
    0: "Guest",
    1: "Customer",
    2: "Employee",
    3: "Admin"
}
export const LOWERCASE_EXP = /[a-z]/;
export const UPPERCASE_EXP = /[A-Z]/;
export const SPECIAL_CHAR_EXP = /[!@#$%^&*(),.?":{}|<>]/;
export const MIN_LENGTH_EXP = /^.{8,}$/;
export const NUMERIC_EXP = /[0-9]/;
export const PASSWORD_EXP = /^(?=.*[A-Z])(?=.*\d)(?=.*\W)[A-Za-z\d\W]{8,}$/;