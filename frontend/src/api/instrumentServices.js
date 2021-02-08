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

