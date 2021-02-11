import userData from './userData.json';
const API_URL = 'http://localhost:8000';

export default class UserServices {
    constructor() { }

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


    async addUser(username, password, first_name, last_name, email) {
        let data = {
            username: username,
            password: password,
            first_name: first_name,
            last_name: last_name,
            email: email
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
            .then(res => res.json())
            .then(json => {
                console.log(json)
            })
    }

    async editUser(username, password, first_name, last_name) {
        let data = {
            username: username,
            password: password,
            first_name: first_name,
            last_name: last_name,
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
            .then(res => res.json())
            .then(json => {
                return json;
            })
    }


    getUser(pk) {
        return userData.usersByKey[pk];
        // const url = `${API_URL}/api/users/${pk}`;
        // return axios.get(url).then(response => response.data);
    }
}