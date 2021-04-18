import Configs from './config.js';
import { checkBadResponse } from './apiUtil';
const API_URL = Configs

export default class CategoryServices {

    // type is either 'instrument' or 'model'
    // showAll is a boolean
    async getCategories(type, showAll, desiredPage) {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        let path = this.typeToPath(type);

        if (path === '') {
            console.error(`Can't get ${type} category, check the getCategories method in categoryServices`);
            let result = {
                success: false,
                data: [],
                errors: []
            }
            return result;
        }



        let url = `${API_URL}/api/${path}/`;
        if (showAll) {
            url += '?get_all';
        } else {
            url += `?page=${desiredPage}`
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

    async getSpecialCategories() {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        let url = `${API_URL}/api/special_categories/`;

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

    // type is either instrument or model
    // name is the category name
    async addCategory(type, name) {
        const token = window.sessionStorage.getItem('token');

        let data = {
            name: name,
        }

        let result = {
            success: true,
            errors: {}
        }

        let path = this.typeToPath(type);
        if (path === '') {
            console.error(`Can't get ${type} category, check the getCategories method in categoryServices`);
            let result = {
                success: false,
                data: [],
                errors: []
            }
            return result;
        }

        return fetch(`${API_URL}/api/${path}/`, {
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
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            })
    }

    // type is either instrument or model
    async editCategory(type, name, pk) {
        const token = window.sessionStorage.getItem('token');

        let data = {
            name: name,
        }

        let result = {
            success: true,
            errors: {}
        }

        let path = this.typeToPath(type);
        if (path === '') {
            console.error(`Can't get ${type} category, check the getCategories method in categoryServices`);
            let result = {
                success: false,
                data: [],
                errors: []
            }
            return result;
        }

        return fetch(`${API_URL}/api/${path}/${pk}/`, {
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

    async deleteCategory(type, pk, force_delete) {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: true,
            errors: {}
        }

        let path = this.typeToPath(type);
        if (path === '') {
            console.error(`Can't get ${type} category, check the getCategories method in categoryServices`);
            let result = {
                success: false,
                data: [],
                errors: []
            }
            return result;
        }

        let body = {
            force_delete: force_delete
        }
        return fetch(`${API_URL}/api/${path}/${pk}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`
            },
            body: JSON.stringify(body)
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


    typeToPath(type) {
        switch (type) {
            case 'instrument':
                return `instrument_categories`;

            case 'model':
                return 'model_categories'

            default:
                return '';
        }
    }

}