import Configs from './config.js';
import { checkBadResponse } from './apiUtil';
const API_URL = Configs

export default class FormCalServices {
    async getExistingForm(model_pk)
    {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: false,
            data: [],
        }

        let url = `${API_URL}/api/calibration_form/${model_pk}/`;

        return fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `JWT ${token}`,
            },
        }).then(res => {
            console.log(res);
            if (res.ok) {
                return res.json().then(json => {
                    console.log(json);
                    result.success = true;
                    result.data = json;
                    return result;
                });
            }
            else {
                return res.json().then(async (json) => {
                    console.log(json);
                    return await checkBadResponse(json, result);
                });
            }
        })

    }

    async createForm(form, model_pk)
    {
        console.log(form)
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: false,
            data: [],
        }
        for (var i = 0; i < form.length; i++) {
            form[i]['index'] = i+1;
        }

        let data = {
            fields: form
        }


        let url = `${API_URL}/api/calibration_form/${model_pk}/`;

        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`,
            },
            body: JSON.stringify(data)

        }).then(res => {
            console.log(res);
            if (res.ok) {
                return res.json().then(json => {
                    console.log(json);
                    result.success = true;
                    result.data = json;
                    return result;
                });
            }
            else {
                return res.json().then(async (json) => {
                    result.success = false;
                    console.log(json)
                    return await checkBadResponse(json, result);
                });
            }
        })

    }


    async submitFormData(instrument_pk, date, comment, categories, form)
    {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: false,
            data: [],
        }

        let cal_event = {
            instrument: Number(instrument_pk),
            date: date,
            comment: comment,
            calibrated_by_instruments: categories, 
        }

        let data = {
            cal_event: cal_event,
            fields: form
        }

        console.log(data)

        let url = `${API_URL}/api/submit_calibration_form/`;

        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`,
            },
            body: JSON.stringify(data)

        }).then(res => {
            console.log(res);
            if (res.ok) {
                return res.json().then(json => {
                    result.success = true;
                    result.data = json;
                    return result;
                });
            }
            else {
                return res.json().then(async (json) => {
                    console.log(json);
                    return await checkBadResponse(json, result);
                });
            }
        }) 

    }

    async viewFormSubmission(cal_pk){
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: false,
            data: [],
        }

        let url = `${API_URL}/api/view_submitted_form/${cal_pk}/`;

        return fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `JWT ${token}`,
            },
        }).then(res => {
            console.log(res);
            if (res.ok) {
                return res.json().then(json => {
                    console.log(json);
                    result.success = true;
                    result.data = json;
                    return result;
                });
            }
            else {
                return res.json().then(async (json) => {
                    console.log(json);
                    return await checkBadResponse(json, result);
                });
            }
        })
    }

}