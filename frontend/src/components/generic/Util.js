
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

const mimeToExtension = {
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    "application/pdf": ".pdf",
    "image/jpeg": ".jpeg",
    "image/png": ".png",
    "image/gif": ".gif",
    "text/csv": ".csv"
}

// url obtained from a blob object
//name is the name of the file, doesnt need the extension
const nameAndDownloadFile = (blobURL, name, mimeType) => {
    const link = document.createElement("a");
    link.href = blobURL;
    if (!mimeToExtension[mimeType]) {
        console.log(`Mime type not mapped, talk to carrie: ${mimeType}`);
        return null;
    }
    link.download = name + mimeToExtension[mimeType];
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

// returns true if the user's permission covers performing calibrations
const hasCalibrationAccess = (permissionGroups) => {
    return (permissionGroups.includes('admin') || permissionGroups.includes('calibration_approver') || permissionGroups.includes('calibrations'));
}

// returns true if the user's permissions cover modifying models + model categories
const hasModelEditAccess = (permissionGroups) => {
    return (permissionGroups.includes('admin') || permissionGroups.includes('models'));
}

// returns true if the user's permissions cover modifying instruments + instrument categories
const hasInstrumentEditAccess = (permissionGroups) => {
    return (permissionGroups.includes('admin') || permissionGroups.includes('models') || permissionGroups.includes('instruments'));
}

// returns true if the user has admin access
const hasAdminAccess = (permissionGroups) => {
    return permissionGroups.includes('admin');
}

const hasApprovalAccess = (permissionGroups) => {
    return permissionGroups.includes('admin') || permissionGroups.includes('calibration_approver');
}

const getHighestPriv = (permissionGroups) =>{
    if (hasAdminAccess(permissionGroups)) return 'admin'
    else if (hasModelEditAccess(permissionGroups)) return 'models'
    else if (hasInstrumentEditAccess(permissionGroups)) return 'instruments'
    else if (hasApprovalAccess(permissionGroups)) return 'calibration_approver'
    else if (hasCalibrationAccess(permissionGroups)) return 'calibrations'
    else return ''
}

// maps the calibration modes to a frontend display name
export const CalibrationModeDisplayMap = {
    "load_bank": "Load Bank",
    "klufe_k5700": "Guided Hardware",
    "custom_form": "Custom Form",
};

export const PrivilegesDisplayMap = {
    "admin": "Admin",
    "models": "Model",
    "instruments": "Instrument",
    "calibrations": "Calibration",
};


export { dateToString, rawErrorsToDisplayed, nameAndDownloadFile, hasInstrumentEditAccess, hasModelEditAccess, hasCalibrationAccess, hasAdminAccess, mimeToExtension, hasApprovalAccess, getHighestPriv };