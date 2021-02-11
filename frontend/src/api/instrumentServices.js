import instrumentData from './instrumentData.json';

const API_URL = 'http://localhost:8000';

export default class InstrumentServices {
    constructor() { }

    // handled modified/expired tokens
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
            }
            )
    }

    // handled modified/expired tokens
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

    // handled modified/expired tokens
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

    // Error handling in place for bad input
    async addInstrument(model_pk, serial_number, comment) {
        let data = {
            item_model: model_pk,
            serial_number: serial_number,
            comment: comment
        }

        let result = {
            success: true,
            errors: {}
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

    // handling field errors and modification/expiration of tokens
    async editInstrument(instrumentPk, model_pk, serial_number, comment) {
        let data = {
            item_model: model_pk,
            serial_number: serial_number,
            comment: comment
        }

        let result = {
            success: true,
            errors: []
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
            .then(res => {
                if (res.ok) {
                    return result;
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

    // handled modified/expired token
    async deleteInstrument(instrumentPk) {
        const token = localStorage.getItem('token');

        let result = {
            success: true,
            errors: []
        }

        return fetch(`${API_URL}/api/instruments/${instrumentPk}/`, {
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


    // Note: the date needs to be a string
    // Error handling in place for future dates
    async addCalibrationEvent(instrument_pk, date, comment) {
        let data = {
            instrument: instrument_pk,
            date: date,
            comment: comment
        }

        let result = {
            success: true,
            errors: []
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
            .then(res => {
                if (res.ok) {
                    return result;
                } else {
                    return res.json().then(json => {
                        result.success = false;
                        result.errors = json;
                        console.log(result.errors)
                        return result;
                    })
                }
            })
    }

    async getSortedInstruments(sortingKey) {
        const token = localStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        const url = `${API_URL}/api/instrument_search/?sort_by=${sortingKey}`;
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

