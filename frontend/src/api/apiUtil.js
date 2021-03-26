
// takes in the response json after a bad apu call and performs window
// reloads as necessary
const checkBadResponse = async (jsonRes, result) => {
    result.success = false;
    if (jsonRes.detail === 'Signature has expired.') {
        window.location.reload();
        return result;
    }
    if (jsonRes.detail === 'Error decoding signature.') {
        window.location.reload();
        return result;
    }
    if (jsonRes.permission_error && (jsonRes.permission_error[0] === 'User does not have permission.')) {
        console.log('no permission');
        window.location.reload();
        return result;
    }
    result.success = false;
    result.errors = jsonRes;
    return result;
}

export { checkBadResponse };