import userData from './userData.json';
const API_URL = 'http://localhost:8000';

export default class UserServices {
    constructor() { }

    // handles modified/expired token
    getUsers() {
        const token = localStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        const url = `${API_URL}/api/users/`;
        return fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `JWT ${token}`
            },
        })
            .then(res => {
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
            })
    }

    // handleds expired/modified tokens
    async addUser(username, password, first_name, last_name, email) {
        let data = {
            username: username,
            password: password,
            first_name: first_name,
            last_name: last_name,
            email: email
        }

        let result = {
            success: true,
            errors: []
        }
        const token = localStorage.getItem('token');

        return fetch(`${API_URL}/create_user/`, {
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

    // handles modified/expired tokens
    async editUser(username, password, first_name, last_name) {
        let data = {
            username: username,
            password: password,
            first_name: first_name,
            last_name: last_name,
        }

        let result = {
            success: false,
            errors: []
        }
        const token = localStorage.getItem('token');

        return fetch(`${API_URL}/current_user/`, {
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


    getUser(pk) {
        return userData.usersByKey[pk];
        // const url = `${API_URL}/api/users/${pk}`;
        // return axios.get(url).then(response => response.data);
    }
}
