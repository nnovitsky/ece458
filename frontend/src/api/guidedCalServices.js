import Configs from './config.js';
import { checkBadResponse } from './apiUtil';
const API_URL = Configs

export default class GuidedCalServices {
    async connectSSH()
    {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: false,
            data: [],
        }

        let url = `${API_URL}/api/start_klufe_cal/`;

        return fetch(url, {
            method: 'GET',
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
                return res.json().then(async (json) => {
                    result.data = this.identifyErrors(json);
                    return await checkBadResponse(json, result);
                });
            }
        })

    }



    async setSource(index) {
        const token = window.sessionStorage.getItem('token');

        let data = {
            index: index,
        }

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
                    window.sessionStorage.setItem("source", "on");
                    result.success = true;
                    result.data = json;
                    return result;
                });
            }
            else {
                return res.json().then(async (json) => {
                    return await checkBadResponse(json, result);
                });
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
                window.sessionStorage.removeItem("source");
                return res.json().then(json => {
                    result.success = true;
                    result.data = json;
                    return result;
                });
            }
            else {
                return res.json().then(async (json) => {
                    return await checkBadResponse(json, result);
                });
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
                    window.sessionStorage.setItem("source", "on");
                    result.success = true;
                    result.data = json;
                    return result;
                });
            }
            else {
                return res.json().then(async (json) => {
                    return await checkBadResponse(json, result);
                });
            }
        })
    }

    async createKlufeCal(instrument, date, comment, userPK, calibratedWith)
    {
        const token = window.sessionStorage.getItem('token');

        let data = {
            instrument: instrument,
            date: date,
            user: userPK,
            comment: comment,
            calibrated_by_instruments: calibratedWith, 
        }
        let result = {
            success: false,
            data: [],
        }

        let url = `${API_URL}/api/start_klufe_cal/`;

        return fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`,
            },
            body: JSON.stringify(data),
        }).then(res => {
            if (res.ok) {
                return res.json().then(json => {
                    result.success = true;
                    result.data = json;
                    return result;
                });
            }
            else {
                console.log(res)
                return res.json().then(async (json) => {
                    result.data = this.identifyErrors(json);
                    return await checkBadResponse(json, result);
                });
            }
        })

    }


    async validateMultimeterDisplay(klufePK, index, voltage)
    {
        const token = window.sessionStorage.getItem('token');

        let data = {
            index: index,
            value: voltage,
        }

        let result = {
            success: false,
            data: [],
        }

        let url = `${API_URL}/api/klufe_test/${klufePK}/`;

        return fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`,
            },
            body: JSON.stringify(data),
        }).then(res => {
            if (res.ok) {
                return res.json().then(json => {
                    result.success = true;
                    result.data = json;
                    return result;
                });
            }
            else {
                console.log(res)
                return res.json().then(async (json) => {
                    result.data = this.identifyErrors(json);
                    return await checkBadResponse(json, result);
                });
            }
        })

    }

    async getKlufeCalDetails(klufePK)
    {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: false,
            data: [],
            errors: [],
        }

        let url = `${API_URL}/api/klufe_detail/${klufePK}/`;

        return fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `JWT ${token}`,
            },
        }).then(res => {
            if (res.ok) {
                return res.json().then(json => {
                    result.success = true;
                    result.data = json.data;
                    result.errors = json.errors;
                    return result;
                });
            }
            else {
                console.log(res)
                return res.json().then(async (json) => {
                    result.data = this.identifyErrors(json);
                    return await checkBadResponse(json, result);
                });
            }
        })

    }


    async deleteKlufeCal(klufePK)
    {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: false,
            data: [],
            errors: [],
        }

        let url = `${API_URL}/api/cancel_klufe_cal/${klufePK}/`;

        return fetch(url, {
            method: 'DELETE',
            headers: {
                Authorization: `JWT ${token}`,
            },
        }).then(res => {
            if (res.ok) {
                result.success = true;
                return result;
            }
            else {
                console.log(res)
                return res.json().then(async (json) => {
                    result.data = this.identifyErrors(json);
                    return await checkBadResponse(json, result);
                });
            }
        })

    }


    async updateKlufeCal(date, comment, klufePK)
    {
        const token = window.sessionStorage.getItem('token');

        let data = {
            date: date,
            comment: comment,
        }

        let result = {
            success: false,
            data: [],
        }

        let url = `${API_URL}/api/update_klufe_cal/${klufePK}/`;

        return fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`,
            },
            body: JSON.stringify(data),
        }).then(res => {
            if (res.ok) {
                return res.json().then(json => {
                    result.success = true;
                    result.data = json;
                    return result;
                });
            }
            else {
                console.log(res)
                return res.json().then(async (json) => {
                    result.data = this.identifyErrors(json);
                    return await checkBadResponse(json, result);
                });
            }
        })

    }




    identifyErrors(json) {
        let error = []
        if (json.instrument) {
            error = ["Instrument: " + json.instrument]
        }
        else if (json.date) {
            error = [json.date]
        }
        else if (json.user) {
            error = ["User: " + json.user]
        }
        else if (json.klufe_calibration_test_failed) {
            error = [json.klufe_calibration_test_failed]
        }
        return error
    }
    
}