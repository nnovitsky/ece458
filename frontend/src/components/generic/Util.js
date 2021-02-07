
// takes in a js date object and returns a string in the formatting
// the backend has agreed upon
const dateToString = (date) => {
    return (`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`)
}

export { dateToString };