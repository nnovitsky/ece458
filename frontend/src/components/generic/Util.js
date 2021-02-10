
// takes in a js date object and returns a string in the formatting
// the backend has agreed upon
const dateToString = (date) => {
    return (date.getFullYear() + '-'
        + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + (('0' + date.getDate()).slice(-2)));
}

// 'errorsArr' Takes in an array of errors that can be gotten from the api fetch
// 'errorBlock' the portion of json to try to match errors, this will likely be from one of the files in ErrorMapping
const rawErrorsToDisplayed = (errorArr, errorBlock) => {
    let formattedErrors = [];
    for (var key in errorArr) {
        let currentJson = errorBlock[key];
        errorArr[key].forEach(currentErrorKey => {
            formattedErrors.push(currentJson[currentErrorKey]);
        })
    }
    return formattedErrors;
}


export { dateToString, rawErrorsToDisplayed };