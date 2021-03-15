
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
        if (errorBlock[key] === undefined) {
            console.log(`No catch for the following key: ${key}`);
            console.log(errorArr);
        } else {
            let currentJson = errorBlock[key];
            errorArr[key].forEach(currentErrorKey => {
                if (currentJson[currentErrorKey] === undefined) {
                    console.log(`No catch for the following error: ${currentErrorKey} with key: ${key}`);
                }
                formattedErrors.push(currentJson[currentErrorKey]);
            })
        }

    }
    return formattedErrors;
}

// url obtained from a blob object
//name is the name of the file, doesnt need the extension
const nameAndDownloadFile = (blobURL, name) => {
    const link = document.createElement("a");
    link.href = blobURL
    link.download = name;
    document.body.appendChild(link);
    link.dispatchEvent(
        new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        })
    )
    // window.open(result.url, '_blank');
    URL.revokeObjectURL(blobURL);
}

export const CalibrationModeDisplayMap = {
    "load_bank": "Load Bank"
};

export const PrivilegesDisplayMap = {
    "admin": "Admin",
    "models": "Model",
    "instruments": "Instrument",
    "calibrations": "Calibration",
};


export { dateToString, rawErrorsToDisplayed, nameAndDownloadFile };