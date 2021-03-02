import Configs from './config.js';
const API_URL = Configs

export default class WizardServices {
    constructor() { }

    async getModelAssetTagByPK(model_pk) {
        const token = localStorage.getItem('token');

        let result = {
            success: false,
            data: [],
        }

        let url = `${API_URL}/api/get_asset_nums/${model_pk}/`;

        return fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `JWT ${token}`
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
                    result.success = false;
                    result.data = json;
                    return result;
                })
            }
        })

    }

    async createLoadbankCalEvent(instrument_pk, date) {
        const token = localStorage.getItem('token');
        let data = {
            instrument: instrument_pk,
            date: date,
        }

        let result = {
            success: false,
            data: [],
        }

        let url = `${API_URL}/api/new_loadbank_cal/`;

        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`
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
                    result.success = false;
                    result.data = json;
                    return result;
                })
            }
        })

    }

    async cancelLoadbankCalEvent(loadCalNum){
        const token = localStorage.getItem('token');

        let result = {
            success: false,
            data: [],
        }

        let url = `${API_URL}/api/cancel_lb_cal/${loadCalNum}/`;

        return fetch(url, {
            method: 'DEL',
            headers: {
                Authorization: `JWT ${token}`
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
                    result.success = false;
                    result.data = json;
                    return result;
                })
            }
        })


    }

    async addCurrentReading(load_level, cr, ca, ideal, index, lb_cal_num){
        const token = localStorage.getItem('token');
        let data = {
            load: load_level,
            cr: cr,
            ca: ca,
            ideal: ideal,
            index: index,
        }

        let result = {
            success: false,
            data: [],
            error: null
        }

        let url = `${API_URL}/api/add_current_reading/${lb_cal_num}/`;

        return fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`
            },
            body: JSON.stringify(data)
        }).then(res => {
            if (res.ok) {
                return res.json().then(json => {
                    result.success = true;
                    result.data = json.data;
                    result.error = json.error;
                    console.log(json)
                    return result;
                });
            }
            else {
                return res.json().then(json => {
                    console.log(json)
                    result.success = false;
                    result.data = json;
                    result.error = json;
                    return result;
                })
            }
        })


    }


    async addVoltageReading(vr, va, test_voltage, lb_cal_num){
        const token = localStorage.getItem('token');
        let data = {
            vr: vr,
            va: va,
            test_voltage: test_voltage,
        }

        let result = {
            success: false,
            data: [],
        }

        let url = `${API_URL}/api/add_voltage_reading/${lb_cal_num}/`;

        return fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`
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
                    result.success = false;
                    result.data = json;
                    return result;
                })
            }
        })


    }

}
