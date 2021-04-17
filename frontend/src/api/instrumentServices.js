import Configs from './config.js';
import { checkBadResponse } from './apiUtil';
const API_URL = Configs

export default class InstrumentServices {

    // handled modified/expired tokens
    async getInstruments(filters, sort_by, show_all, pageNum, perPage) {
        const token = window.sessionStorage.getItem('token');
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
            url = `${url}&page=${pageNum}&results_per_page=${perPage}`
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
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            }
            )
    }

    // used to get the serial numbers for the model detail view
    async getInstrumentsByModelPk(model_pk, pageNum, showAll, perPage) {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        let url = `${API_URL}/api/instrument_search/?model_pk=${model_pk}`;

        if (showAll) {
            url = `${url}&get_all`
        } else {
            url = `${url}&page=${pageNum}&results_per_page=${perPage}`
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
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            }
            )
    }

    // handled modified/expired tokens
    async getInstrument(instrumentPk) {
        const token = window.sessionStorage.getItem('token');

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
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            })
    }

    // Error handling in place for bad input
    // handled modified/expired tokens
    async addInstrument(model_pk, serial_number, comment, categories, asset_tag) {
        let data = {
            item_model: model_pk,
            comment: comment,
            instrumentcategory_set: categories.map(el => el.pk),
        }

        if (asset_tag !== '') {
            data.asset_tag = asset_tag;
        }

        if (serial_number !== '') {
            data.serial_number = serial_number;
        }

        let result = {
            success: true,
            errors: {}
        }
        const token = window.sessionStorage.getItem('token');

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
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            })
    }

    // handling field errors and modification/expiration of tokens
    async editInstrument(instrumentPk, model_pk, serial_number, comment, categories, asset_tag) {
        let data = {
            item_model: model_pk,
            comment: comment,
            instrumentcategory_set: categories.map(el => el.pk),
            asset_tag: asset_tag
        }

        if (serial_number !== '') {
            data.serial_number = serial_number;
        }

        let result = {
            success: true,
            errors: []
        }
        const token = window.sessionStorage.getItem('token');

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
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            })
    }

    // handled modified/expired token
    async deleteInstrument(instrumentPk) {
        const token = window.sessionStorage.getItem('token');

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
                return res.json().then(async (json) => {
                    return await checkBadResponse(json, result);
                });
            }
        })
    }


    // Note: the date needs to be a string
    // Error handling in place for future dates
    async addCalibrationEvent(instrument_pk, date, comment, file, calibratorInstrumentArr) {
        const formData = new FormData();
        formData.append('instrument', instrument_pk);
        formData.append('date', date);
        formData.append('comment', comment);
        console.log(calibratorInstrumentArr);
        console.log(instrument_pk);
        if (file !== '') {
            formData.append('file', file);
        }
        if(calibratorInstrumentArr.length > 0) {
            formData.append('calibrated_by_instruments', JSON.stringify(calibratorInstrumentArr));
        }

        let result = {
            success: true,
            errors: [],
            data: [],
        }

        const token = window.sessionStorage.getItem('token');

        return fetch(`${API_URL}/api/calibration_events/`, {
            method: 'POST',
            headers: {
                Authorization: `JWT ${token}`
            },
            body: formData
        })
            .then(res => {
                if (res.ok) {
                    console.log(res);
                    return result;
                } else {
                    if (res.status === 413) {
                        let error = {
                            "non_field_errors": [
                                "File size too large."
                            ]
                        }
                        result.success = false;
                        result.errors = error;
                    }
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            })
    }

    async setCalEventApproval(calPk, comment, isApproved) {
        let result = {
            success: true,
            errors: {}
        }
        const data = {
            comment: comment,
            approved: isApproved,
        };
        console.log(data);
        const token = window.sessionStorage.getItem('token');

        return fetch(`${API_URL}/api/calibration_approval/${calPk}/`, {
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
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            });
    }

    async validateCalibratorInstrument(instrumentPk, calibratorAssetTag) {
        let result = {
            success: true,
            errors: {}
        }

        const token = window.sessionStorage.getItem('token');
        const body = {
            instrument_pk: instrumentPk,
            calibrator_asset_tags: [
                calibratorAssetTag
            ]
        }

        console.log(body);

        return fetch(`${API_URL}/api/validate_calibrators/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`
            },
            body: JSON.stringify(body),
        })
            .then(res => {
                if (res.ok) {
                    return res.json().then(json => {
                        result.data = json;
                        console.log(result);
                        return result;
                    });
                } else {
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            });
    }

    async getCalEventApproval(calPk) {
        let result = {
            success: true,
            errors: {}
        }
        const token = window.sessionStorage.getItem('token');

        return fetch(`${API_URL}/api/calibration_approval/${calPk}/`, {
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
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            });
    }

    async getCalFromInstrument(pk, pageNum, showAll, perPage) {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: true,
            data: [],
            errors: []
        }

        let url = `${API_URL}/api/calibration_event_search/?instrument_pk=${pk}`;
        if (showAll) {
            url = `${url}&get_all`
        } else {
            url = `${url}&page=${pageNum}&results_per_page=${perPage}`
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
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            })
    }

    // safely handled modified/expired tokens
    async getCalibrationPDF(pk, hasChainOfTruth) {
        const token = window.sessionStorage.getItem('token');

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
                        result.type = blob.type;
                        return URL.createObjectURL(blob)
                    })
                        .then(url => {
                            result.url = url;
                            return result;
                        })
                } else {
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            })
    }

    async getCalEventFile(cal_pk) {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: true,
            url: [],
        }

        const url = `${API_URL}/api/calibration_event_file/${cal_pk}`;
        return fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `JWT ${token}`
            }
        })
            .then(res => {
                if (res.ok) {
                    console.log(res);
                    return res.blob().then(blob => {
                        result.type = blob.type;
                        return URL.createObjectURL(blob)
                    })
                        .then(url => {
                            result.url = url;
                            console.log(result);
                            return result;
                        })
                } else {
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            })
    }

    async getAssetBarcodes(pksArr, filters, sort_by, select_all) {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        console.log(select_all)

        const body = {
            select_all,
            instrument_pks: pksArr
        }

        const urlParams = new URLSearchParams({
            ...filters,
        });

        let url = `${API_URL}/api/export_barcodes/?${urlParams}`;
        // let count = 0;
        // for (var key in filters) {
        //     if (count > 0) {
        //         url += '&';
        //     }
        //     url += (key + `=${filters[key]}`);
        //     count++;
        // }

        // if (sort_by !== '') {
        //     url = `${url}&sort_by=${sort_by}`;
        // }

        // url += `&instrument_pks=${pksArr.join('')}`;
        // url += `&show_all=${select_all}`;
        console.log('making attempt');
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`,
            },
            body: JSON.stringify(body),
        })
            .then(res => {
                if (res.ok) {
                    return res.blob().then(blob => {
                        result.type = blob.type;
                        return URL.createObjectURL(blob)
                    })
                        .then(url => {
                            result.url = url;
                            return result;
                        })
                } else {
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            }
            )
    }



    async importInstrumentCSV(csvFile) {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: true,
            errors: [],
            data: []
        }

        console.log("Import instrument /api/import_models_csv/?get_all")
        return fetch(`${API_URL}/api/import_instruments_csv/?get_all`, {
            method: 'PUT',
            headers: {
                Authorization: `JWT ${token}`,
            },
            body: csvFile
        })
            .then(res => {
                console.log(res)
                if (res.ok) {
                    return res.json().then(json => {
                        result.data = json;
                        return result;
                    });
                } else {
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            })
    }



    async exportInstruments(filters, isAll) {
        const token = window.sessionStorage.getItem('token');

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
                    result.type = blob.type;
                    return URL.createObjectURL(blob)
                })
                    .then(url => {
                        result.url = url;
                        return result;
                    })
            } else {
                return res.json().then(async (json) => {
                    return await checkBadResponse(json, result);
                });
            }
        }
        )
    }


    async exportSampleInstrumentCSV() {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        let url = `${API_URL}/api/export_example_instrument_csv/?`;

        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`
            },
        }).then(res => {
            if (res.ok) {
                return res.blob().then(blob => {
                    result.type = blob.type;
                    return URL.createObjectURL(blob)
                })
                    .then(url => {
                        result.url = url;
                        return result;
                    })
            } else {
                return res.json().then(async (json) => {
                    return await checkBadResponse(json, result);
                });
            }
        }
        )
    }
}

