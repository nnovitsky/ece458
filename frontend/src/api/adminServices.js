import Configs from './config.js';
const API_URL = Configs

export default class AdminServices {
    constructor() { }

    // handles modified/expired token
    async addAdminPriviledges(user_pk) {
        const token = localStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        let url = `${API_URL}/api/toggle_admin/${user_pk}/`;
        return fetch(url, {
            method: 'PUT',
            headers: {
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


    async removeAdminPriviledges(user_pk) {
        const token = localStorage.getItem('token');

        let result = {
            success: false,
            data: [],
        }

        let url = `${API_URL}/api/toggle_admin/${user_pk}/`;
        return fetch(url, {
            method: 'DELETE',
            headers: {
                Authorization: `JWT ${token}`
            },
        })
            .then(res => {
                if (res.ok) {
                    return res.json().then(json => {
                        result.success = true;
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

    async deleteUser(user_pk){
        const token = localStorage.getItem('token');

        let result = {
            success: false,
            data: [],
        }

        let data = {
            delete_user: user_pk,
        }

        let url = `${API_URL}/api/users/`;
        return fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                console.log(res)
                if (res.ok) {
                        result.success = true;
                        return result;
                } else {
                        result.success = false;
                        return result;
                }
            })
    }
}
