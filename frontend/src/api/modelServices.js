import Configs from './config.js';
import { checkBadResponse } from './apiUtil';
const API_URL = Configs

export default class ModelServices {

    // catches if the token is modified, good for error catching
    async getModels(filters, sort_by, show_all, pageNum, perPage) {
        const token = window.sessionStorage.getItem('token');

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
        }).then(res => {
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

    async getNewModelPage(pageUrl) {

        const token = window.sessionStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        const url = `${API_URL + pageUrl}`;
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`
            },
        }).then(res => {
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

    // Catches errors from the backend and has 
    // appropriate error handling if the token gets bad
    async addModel(vendor, modelNumber, description, comment, calFrequency, categories, calMode, calibratorCategories, requiresApproval) {
        const token = window.sessionStorage.getItem('token');

        let data = {
            vendor: vendor,
            model_number: modelNumber,
            description: description,
            comment: comment,
            calibration_frequency: calFrequency,
            itemmodelcategory_set: categories.map(el => el.pk),
            calibration_modes: calMode,
            requires_approval: requiresApproval,
            //calibrator_categories_set: calibratorCategories.map(el => el.pk)
        }

        console.log(data);

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
                    return res.json().then(json => {
                        result.data = json;
                        return result;
                    })
                } else {
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            })
    }


    // Catches errors from the backend and has 

    async editModel(pk, vendor, modelNumber, description, comment, calFrequency, categories, calMode, requiresApproval) {
        const token = window.sessionStorage.getItem('token');

        let data = {
            vendor: vendor,
            model_number: modelNumber,
            description: description,
            comment: comment,
            calibration_frequency: calFrequency,
            itemmodelcategory_set: categories.map(el => el.pk),
            calibration_modes: calMode,
            requires_approval: requiresApproval,
        }

        console.log(data)

        let result = {
            success: true,
            errors: []
        }

        return fetch(`${API_URL}/api/models/${pk}/`, {
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

    // handling bad auth token
    async getModel(pk) {
        const token = window.sessionStorage.getItem('token');

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
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            })
    }

    async deleteModel(pk) {
        const token = window.sessionStorage.getItem('token');
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
                return res.json().then(async (json) => {
                    return await checkBadResponse(json, result);
                });
            }
        })

    }

    // // handles bad token
    // async modelFilterSearch(filters) {
    //     const token = window.sessionStorage.getItem('token');

    //     let result = {
    //         success: true,
    //         data: [],
    //     }

    //     let url = `${API_URL}/api/model_search/?`;
    //     let count = 0;
    //     for (var key in filters) {
    //         if (count > 0) {
    //             url += '&';
    //         }
    //         url += (key + `=${filters[key]}`);
    //         count++;
    //     }

    //     return fetch(url, {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             Authorization: `JWT ${token}`
    //         },
    //     }).then(res => {
    //         if (res.ok) {
    //             return res.json().then(json => {
    //                 result.data = json;
    //                 return result;
    //             });
    //         } else {
    //             return res.json().then(json => {
    //                 if (json.detail === 'Signature has expired.') {
    //                     window.location.reload();
    //                     result.success = false;
    //                 }
    //                 if (json.detail === 'Error decoding signature.') {
    //                     window.location.reload();
    //                     result.success = false;
    //                 }
    //                 result.success = false;
    //                 result.errors = json;
    //                 return result;
    //             })
    //         }
    //     })
    // }

    async getCalModes() {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: true,
            data: [],
            errors: []
        }

        let url = `${API_URL}/api/calibration_modes/`;

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

    // has handling if the token is modified/expired
    async getVendors() {
        const token = window.sessionStorage.getItem('token');

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
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            })
    }

       // has handling if the token is modified/expired
    async getModelByVendor(vendor) {
        const token = window.sessionStorage.getItem('token');

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

    async importModelCSV(csvFile) {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: true,
            errors: [],
            data:[]
        }
        console.log("Import models /api/import_models_csv/?get_all")
        return fetch(`${API_URL}/api/import_models_csv/?get_all`, {
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

    async exportModels(filters, isAll) {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        let url = `${API_URL}/api/export_models_csv/?`;
        let count = 0;
        for (var key in filters) {
            if (count > 0) {
                url += '&';
            }
            url += (key + `= ${filters[key]}`);
            count++;
        }

        if (isAll) {
            url += `&export_instruments`
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

    async exportSampleModelCSV() {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        let url = `${API_URL}/api/export_example_model_csv/?`;

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

