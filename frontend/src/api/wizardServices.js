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

    async createLoadbankCalEvent(instrument_pk, date, cal_event_pk) {
        const token = localStorage.getItem('token');
        let data = {
            instrument: instrument_pk,
            date: date,
        }

        if(cal_event_pk !== null)
        {
            data["cal_event_pk"] = cal_event_pk
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
                    console.log(json)
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

    async cancelLoadbankCalEvent(loadCalNum) {
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

    async addCurrentReading(load_level, cr, ca, ideal, index, lb_cal_num) {
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
                    result.error = this.identifyErrors(json);
                    return result;
                })
            }
        })

    }

    identifyErrors(json) {
        let error = []
        if (json.ca) {
            error = ['Current actual: ' + json.ca]
        }
        else if (json.cr) {
            error = ['Current reported: ' + json.cr]
        }
        else if (json.index) {
            error = ['Index: ' + json.index]
        }
        else if (json.load) {
            error = ['Load level: ' + json.load]
        }
        else if(json.va){
            error = ["Voltage actual: " + json.va]
        }
        else if(json.vr){
            error = ["Voltage reported: " + json.vr]
        }
        else if(json.loadbank_error){
            error = [json.loadbank_error]
        }
        return error
    }


    async addVoltageReading(vr, va, test_voltage, lb_cal_num) {
        const token = localStorage.getItem('token');
        let data = {
            vr: vr,
            va: va,
            test_voltage: test_voltage,
        }

        let result = {
            success: false,
            data: [],
            errors: [],
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
                    result.data = json.data;
                    result.errors = [json.error];
                    return result;
                });
            }
            else {
                return res.json().then(json => {
                    console.log(json)
                    result.success = false;
                    result.data = json;
                    result.errors = this.identifyErrors(json);
                    return result;
                })
            }
        })


    }


    async getTestVoltage() {
        const token = localStorage.getItem('token');
        let result = {
            success: false,
            data: [],
        }

        let url = `${API_URL}/api/voltage_test/`;

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


    async updateLBCal(key, value, lb_cal_num) {
        const token = localStorage.getItem('token');
        let result = {
            success: false,
            data: [],
        }

        let data = this.getUpdateLBJSON(key, value);


        let url = `${API_URL}/api/update_lb_cal/${lb_cal_num}/`;

        return fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`,
            },
            body: JSON.stringify(data)
        }).then(res => {
            if (res.ok) {
                return res.json().then(json => {
                    console.log(json)
                    result.success = true;
                    result.data = json;
                    return result;
                });
            }
            else {
                return res.json().then(json => {
                    console.log(json)
                    result.success = false;
                    result.data = json;
                    return result;
                })
            }
        })

    }

    getUpdateLBJSON(key, value) {
        console.log("here")
        let data = {}
        switch (key) {
            case "shuntmeter":
                data = { shuntmeter: value }
                return data
            case "voltmeter":
                data = { voltmeter: value }
                return data
            case "visual_inspection":
                data = { visual_inspection : value}
                return data
            case "auto_cutoff":
                data = { auto_cutoff : value }
                return data
            case "alarm":
                data = { alarm : value }
                return data
            case "recorded_data":
                data = { recorded_data : value }
                return data
            case "printer":
                data = { printer : value }
                return data
        }
    }


    async getLoadLevelSet(index)
    {
        const token = localStorage.getItem('token');
        let result = {
            success: false,
            data: [],
        }


        let url = `${API_URL}/api/load_levels/${index}/`;

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
                    console.log(result.data);
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


