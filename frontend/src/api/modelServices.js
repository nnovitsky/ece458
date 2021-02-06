import modelData from './modelData.json';

const API_URL = 'http://localhost:8000';

export default class ModelServices {
    constructor() { }

    async getModels() {
        const token = localStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        const url = `${API_URL}/api/models/`;
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
                    console.log("Direct response:")
                    console.log(json)
                    result.data = json.data
                    console.log(result)
                    return result
                },
                (error) => {
                    console.log(error)
                    result.success = false;
                    return result
                }
            )
    }

    getModel(pk) {
        return modelData.modelsByKey[pk];
        // const url = `${API_URL}/api/customers/${pk}`;
        // return axios.get(url).then(response => response.data);
    }

    getAllModelNumbers() {
        let result = new Set();
        modelData.getModels.forEach(el => {
            result.add(el["model number"]);
        })
        return Array.from(result);
    }

    getAllVendors() {
        let result = new Set();
        modelData.getModels.forEach(el => {
            result.add(el["vendor"]);
        })
        return Array.from(result);
    }

    getAllDescriptions() {
        let result = new Set();
        modelData.getModels.forEach(el => {
            result.add(el["description"]);
        })
        return Array.from(result);
    }

    getAllCallibrationFrequencies() {
        let result = new Set();
        modelData.getModels.forEach(el => {
            result.add(el["callibration frequency"]);
        })
        return Array.from(result);
    }
}

