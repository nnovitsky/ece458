import React from 'react';
import userData from './userData.json';
import axios from 'axios';

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

    getUser(pk) {
        return userData.usersByKey[pk];
        // const url = `${API_URL}/api/users/${pk}`;
        // return axios.get(url).then(response => response.data);
    }
}