import Configs from './config.js';
const API_URL = Configs

export default class GuidedCalServices {
    constructor() { }

    async setSource(is_AC, voltage, freq) {
        const token = window.sessionStorage.getItem('token');

        let data = {
            voltage: voltage,
        }

        if(is_AC){
            data["is_AC"] = "True";
            data["hertz"] = freq;
        } else { data["is_AC"] = "False"; }


        let result = {
            success: false,
            data: [],
        }

        let url = `${API_URL}/api/set_klufe/`;

        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`,
            },
            body: JSON.stringify(data)
        }).then(res => {
            if (res.ok) {
                return res.json().then(json => {
                    result.success = true;
                    result.data = json;
                    return result;
                });
            }
            else {
                return res.json().then(json => {
                    if (json.detail === 'Signature has expired.') {
                        window.location.reload();
                        result.success = false;
                        return result;
                    }
                    if (json.detail === 'Error decoding signature.') {
                        window.location.reload();
                        result.success = false;
                        return result;
                    }
                    result.success = false;
                    result.data = json;
                    return result;
                })
            }
        })
    }


    async turnOffSource() {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: false,
            data: [],
        }

        let url = `${API_URL}/api/klufe_off/`;

        return fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `JWT ${token}`,
            },
        }).then(res => {
            if (res.ok) {
                return res.json().then(json => {
                    result.success = true;
                    result.data = json;
                    return result;
                });
            }
            else {
                return res.json().then(json => {
                    if (json.detail === 'Signature has expired.') {
                        window.location.reload();
                        result.success = false;
                        return result;
                    }
                    if (json.detail === 'Error decoding signature.') {
                        window.location.reload();
                        result.success = false;
                        return result;
                    }
                    result.success = false;
                    result.data = json;
                    return result;
                })
            }
        })
    }

    async turnOnSource() {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: false,
            data: [],
        }

        let url = `${API_URL}/api/klufe_on/`;

        return fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `JWT ${token}`,
            },
        }).then(res => {
            if (res.ok) {
                return res.json().then(json => {
                    result.success = true;
                    result.data = json;
                    return result;
                });
            }
            else {
                return res.json().then(json => {
                    if (json.detail === 'Signature has expired.') {
                        window.location.reload();
                        result.success = false;
                        return result;
                    }
                    if (json.detail === 'Error decoding signature.') {
                        window.location.reload();
                        result.success = false;
                        return result;
                    }
                    result.success = false;
                    result.data = json;
                    return result;
                })
            }
        })
    }
    
}