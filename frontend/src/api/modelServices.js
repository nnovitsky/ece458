import modelData from './modelData.json';

const API_URL = 'http://localhost:8000';

export default class ModelServices {

    // catches if the token is modified, good for error catching
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
        }).then(res => {
            if (res.ok) {
                return res.json().then(json => {
                    result.data = json.data;
                    return result;
                });
            } else {
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
                    result.errors = json;
                    return result;
                })
            }
        }
        )
    }

    // Catches errors from the backend and has 
    // appropriate error handling if the token gets bad
    async addModel(vendor, modelNumber, description, comment, calFrequency) {
        const token = localStorage.getItem('token');

        let data = {
            vendor: vendor,
            model_number: modelNumber,
            description: description,
            comment: comment,
            calibration_frequency: calFrequency
        }

        let result = {
            success: true,
            errors: []
        }

        return fetch(`${API_URL}/api/models/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                if (res.ok) {
                    return result;
                } else {
                    return res.json().then(json => {
                        if (json.detail === 'Signature has expired.') {
                            window.location.reload();
                            result.success = false;
                        }
                        if (json.detail === 'Error decoding signature.') {
                            window.location.reload();
                            result.success = false;
                        }
                        result.success = false;
                        result.errors = json;
                        return result;
                    })
                }
            })
    }

    // handling bad auth token
    async getModel(pk) {
        console.log("called get model");
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
            .then(res => {
                if (res.ok) {
                    return res.json().then(json => {
                        result.data = json;
                        return result;
                    });
                } else {
                    return res.json().then(json => {
                        if (json.detail === 'Signature has expired.') {
                            window.location.reload();
                            result.success = false;
                        }
                        if (json.detail === 'Error decoding signature.') {
                            window.location.reload();
                            result.success = false;
                        }
                        result.success = false;
                        result.errors = json;
                        return result;
                    })
                }
            })
    }

    async deleteModel(pk) {
        const token = localStorage.getItem('token');
        let result = {
            success: true,
            errors: [],
        }

        return fetch(`${API_URL}/api/models/${pk}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`
            },
        }).then(res => {
            if (res.ok) {
                return result;
            } else {
                return res.json().then(json => {
                    if (json.detail === 'Signature has expired.') {
                        window.location.reload();
                        result.success = false;
                    }
                    if (json.detail === 'Error decoding signature.') {
                        window.location.reload();
                        result.success = false;
                    }
                    result.success = false;
                    result.errors = json;
                    console.log("failed to delete");
                    console.log(json)
                    return result;
                })
            }
        })

    }

    // handles bad token
    async modelFilterSearch(filters) {
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
        }).then(res => {
            if (res.ok) {
                return result;
            } else {
                return res.json().then(json => {
                    if (json.detail === 'Signature has expired.') {
                        window.location.reload();
                        result.success = false;
                    }
                    if (json.detail === 'Error decoding signature.') {
                        window.location.reload();
                        result.success = false;
                    }
                    result.success = false;
                    result.errors = json;
                    return result;
                })
            }
        })
    }

    // has handling if the token is modified/expired
    async getVendors() {
        const token = localStorage.getItem('token');

        let result = {
            success: true,
            data: [],
            errors: []
        }

        let url = `${API_URL}/api/vendors/`;

        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`
            },
        })
            .then(res => {
                if (res.ok) {
                    return res.json().then(json => {
                        result.data = json;
                        return result;
                    });
                } else {
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
                        result.errors = json;
                        return result;
                    })
                }
            })
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

    async getSortedModels(sortingKey) {
        const token = localStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        const url = `${API_URL}/api/model_search/?sort_by=${sortingKey}`;
        return fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `JWT ${token}`
            }
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

