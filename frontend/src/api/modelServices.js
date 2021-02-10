import modelData from './modelData.json';

const API_URL = 'http://localhost:8000';

export default class ModelServices {
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

    async addModel(vendor, modelNumber, description, comment, calFrequency) {
        let data = {
            vendor: vendor,
            model_number: modelNumber,
            description: description,
            comment: comment,
            calibration_frequency: calFrequency
        }

        console.log(data);
        const token = localStorage.getItem('token');

        return fetch(`${API_URL}/api/models/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(json => {
                console.log(json)
            })
    }

    async getModel(pk) {
        const token = localStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        return fetch(`${API_URL}/api/models/${pk}/`, {
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

    async deleteModel(pk) {
        const token = localStorage.getItem('token');
        let result = {
            success: true,
            data: [],
        }

        return fetch(`${API_URL}/api/models/${pk}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`
            },
        })
            
    }

    async modelFilterSearch(filters) {
        console.log(filters)
        const token = localStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        let url = `${API_URL}/api/model_search/?`;
        let count = 0;
        for (var key in filters) {
            if (count > 0) {
                url += '&';
            }
            url += (key + `=${filters[key]}`);
            count++;
        }
        console.log(url)

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
                    console.log(json)
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

    async getVendors() {
        const token = localStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        let url = `${API_URL}/api/vendors/`;

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

    async getModelByVendor(vendor) {
        const token = localStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        let url = `${API_URL}/api/models_by_vendor/${vendor}/`;

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

    async getSortedModels(sortingKey) {
        const token = localStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        const url = `${API_URL}/api/model_search/`;
        return fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `JWT ${token}`
            },
            params: {
                sort_by: sortingKey
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
}

