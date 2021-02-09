import instrumentData from './instrumentData.json';

const API_URL = 'http://localhost:8000';

export default class InstrumentServices {
    constructor() { }

    async getInstruments() {
        const token = localStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        const url = `${API_URL}/api/instruments/`;
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`
            },
        })
            .then(res => res.json())
            .then(
                (json) => {
                    if (json.detail === 'Signature has expired.') {
                        console.log("GET NEW TOKEN")
                        result.success = false;
                    }
                    result.data = json.data
                    return result
                },
                (error) => {
                    console.log(error)
                    result.success = false;
                    return result
                }
            )
    }

    async getInstrument(instrumentPk) {
        const token = localStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        return fetch(`${API_URL}/api/instruments/${instrumentPk}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`
            },
        })
            .then(res => res.json())
            .then(
                (json) => {
                    if (json.detail === 'Signature has expired.') {
                        console.log("GET NEW TOKEN")
                        result.success = false;
                    }
                    result.data = json
                    return result
                },
                (error) => {
                    console.log(error);
                    result.success = false;
                    return result;
                }
        )
    }

    async instrumentFilterSearch(filters) {
        const token = localStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        let url = `${API_URL}/api/instrument_search/?`;
        let count = 0;
        for (var key in filters) {
            if (count > 0) {
                url += '&';
            }
            url += (key + `=${filters[key]}`);
            count++;
        }

        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`
            },
        })
            .then(res => res.json())
            .then(
                (json) => {
                    if (json.detail === 'Signature has expired.') {
                        console.log("GET NEW TOKEN")
                        result.success = false;
                    }
                    result.data = json
                    return result
                },
                (error) => {
                    console.log(error);
                    result.success = false;
                    return result;
                }
            )
    }

    async addInstrument(model_pk, serial_number, comment) {
        let data = {
            item_model: model_pk,
            serial_number: serial_number,
            comment: comment
        }
        const token = localStorage.getItem('token');

        return fetch(`${API_URL}/api/instruments/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(json => {

            })
    }
    async editInstrument(instrumentPk, model_pk, serial_number, comment) {
        let data = {
            item_model: model_pk,
            serial_number: serial_number,
            comment: comment
        }
        const token = localStorage.getItem('token');

        return fetch(`${API_URL}/api/instruments/${instrumentPk}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(json => {
                console.log(json)
                console.log("success")
            })
    }

    // Note: the date needs to be a string
    async addCalibrationEvent(instrument_pk, date, comment) {
        let data = {
            instrument: instrument_pk,
            date: date,
            comment: comment
        }

        const token = localStorage.getItem('token');

        return fetch(`${API_URL}/api/calibration_events/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(json => {

            })
    }

    getInstrumentSerialByModel(modelPk) {
        let result = [];
        instrumentData.instruments.forEach(el => {
            if (el["model pk"] === modelPk) {
                let temp = {
                    "serial": el["serial"],
                    "pk": el["instrument pk"]
                }
                result.push(temp);
            }
        });
        return result;
        // const url = `${API_URL}/api/customers/${pk}`;
        // return axios.get(url).then(response => response.data);
    }

    getAllSerialNumbers() {
        let result = new Set();
        instrumentData.instruments.forEach(el => {
            result.add(el["serial"]);
        })
        return Array.from(result);
    }
}

