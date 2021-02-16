import Configs from './config.js';
const API_URL = Configs

export default class UserServices {
    constructor() { }

    // handles modified/expired token
    getUsers(desiredPage, isShowAll) {
        const token = localStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        let url = `${API_URL}/api/users/?`;
        if (isShowAll) {
            url += `&get_all`;
        } else {
            url += `&page=${desiredPage}`
        }
        return fetch(url, {
            method: 'GET',
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

        return fetch(`${API_URL}/api/create_user/`, {
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
        let data = {};
        if(username !== '')
        {
            data['username'] = username; 
        }
        if(password !== '')
        {
            data['password'] = password; 
        }
        if(first_name !== '')
        {
            data['first_name'] = first_name; 
        }
        if(last_name !== '')
        {
            data['last_name'] = last_name; 
        }
/*         console.log(password);
        console.log(first_name);
        console.log(last_name);
        let data = {
            username: username,
            password: password,
            first_name: first_name,
            last_name: last_name,
        } */

        let result = {
            success: false,
            errors: []
        }
        const token = localStorage.getItem('token');

        return fetch(`${API_URL}/api/current_user/`, {
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

}
