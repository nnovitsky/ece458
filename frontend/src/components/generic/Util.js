
// takes in a js date object and returns a string in the formatting
// the backend has agreed upon
const dateToString = (date) => {
    return (date.getFullYear() + '-'
        + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + (('0' + date.getDate()).slice(-2)));
}

// 
const sortArray = (dataArr, keyToSortBy) => {
    console.log("sort called")
    console.log(dataArr)
    return dataArr.sort((a, b) => (a[keyToSortBy] > b[keyToSortBy]) ? 1 : -1)
}

export { dateToString, sortArray };