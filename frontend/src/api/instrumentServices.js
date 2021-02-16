import Configs from './config.js';
const API_URL = Configs

export default class InstrumentServices {
    constructor() { }

    // handled modified/expired tokens
    async getInstruments(filters, sort_by, show_all, pageNum) {
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

        if (sort_by !== '') {
            url = `${url}&sort_by=${sort_by}`;
        }

        if (show_all) {
            url = `${url}&get_all`
        } else {
            url = `${url}&page=${pageNum}`
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
            }
            )
    }

    // used to get the serial numbers for the model detail view
    async getInstrumentsByModelPk(model_pk, pageNum, showAll) {
        const token = localStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        let url = `${API_URL}/api/instrument_search/?model_pk=${model_pk}`;

        if (showAll) {
            url = `${url}&get_all`
        } else {
            url = `${url}&page=${pageNum}`
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

    // Error handling in place for bad input
    // handled modified/expired tokens
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
                        return result;
                    })
                }
            })
    }

    async getCalFromInstrument(pk, pageNum, showAll) {
        const token = localStorage.getItem('token');

        let result = {
            success: true,
            data: [],
            errors: []
        }

        let url = `${API_URL}/api/calibration_event_search/?instrument_pk=${pk}`;
        if (showAll) {
            url = `${url}&get_all`
        } else {
            url = `${url}&page=${pageNum}`
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

    // safely handled modified/expired tokens
    async getCalibrationPDF(pk) {
        const token = localStorage.getItem('token');

        let result = {
            success: true,
            url: [],
        }

        const url = `${API_URL}/api/export_calibration_event_pdf/${pk}`;
        return fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `JWT ${token}`
            }
        })
            .then(res => {
                if (res.ok) {
                    return res.blob().then(blob => {
                        return URL.createObjectURL(blob)
                    })
                        .then(url => {
                            result.url = url;
                            return result;
                        })
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



    async importInstrumentCSV(csvFile) {
        const token = localStorage.getItem('token');

        let result = {
            success: true,
            errors: [],
            data:[]
        }

        return fetch(`${API_URL}/api/import_instruments_csv/`, {
            method: 'PUT',
            headers: {
                Authorization: `JWT ${token}`,
            },
            body: csvFile
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



    async exportInstruments(filters, isAll) {
        const token = localStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        let url = `${API_URL}/api/export_instruments_csv/?`;
        let count = 0;
        for (var key in filters) {
            if (count > 0) {
                url += '&';
            }
            url += (key + `=${filters[key]}`);
            count++;
        }

        if (isAll) {
            url += `&export_models`;
        }

        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`
            },
        }).then(res => {
            if (res.ok) {
                return res.blob().then(blob => {
                    return URL.createObjectURL(blob)
                })
                    .then(url => {
                        result.url = url;
                        return result;
                    })
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
}

