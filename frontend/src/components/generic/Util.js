
// takes in a js date object and returns a string in the formatting
// the backend has agreed upon
const dateToString = (date) => {
    return (`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`)
}

// 
const sortArray = (dataArr, keyToSortBy) => {
    console.log("sort called")
    console.log(dataArr)
    return dataArr.sort((a, b) => (a[keyToSortBy] > b[keyToSortBy]) ? 1 : -1)
}

export { dateToString, sortArray };