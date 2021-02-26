import Configs from './config.js';
const API_URL = Configs

export default class CategoryServices {

    // type is either 'instrument' or 'model'
    async getCategories(type) {
        const token = localStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        let path;

        switch (type) {
            case 'instrument':
                path = `instrument_categories`;
                break;
            case 'model':
                path = 'model_categories'
                break;
            default:
                console.error(`Can't get ${type} category, check the getCategories method in categoryServices`);
                let result = {
                    success: false,
                    data: [],
                    errors: []
                }
                return result;
        }

        return fetch(`${API_URL}/api/${path}/`, {
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

}