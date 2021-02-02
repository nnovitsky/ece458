import React from 'react';
import userData from './userData.json';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export default class UserServices {
    constructor() { }

    getUsers() {
        return userData.getUsers;
        // const url = `${API_URL}/api/users/`;
        // return axios.get(url).then(response => response.data);
    }

    getUser(pk) {
        return userData.usersByKey[pk];
        // const url = `${API_URL}/api/users/${pk}`;
        // return axios.get(url).then(response => response.data);
    }
}