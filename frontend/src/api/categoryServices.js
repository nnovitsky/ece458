import Configs from './config.js';
const API_URL = Configs

export default class CategoryServices {

    // type is either 'instrument' or 'model'
    // showAll is a boolean
    async getCategories(type, showAll) {
        const token = localStorage.getItem('token');

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

    // type is either instrument or model
    async addCategory(type, name) {
        const token = localStorage.getItem('token');

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