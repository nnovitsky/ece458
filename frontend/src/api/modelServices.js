import React from 'react';
import modelData from './modelData.json';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export default class ModelServices {
    constructor() { }

    getModels() {
        return modelData.models;
        // const url = `${API_URL}/api/models/`;
        // return axios.get(url).then(response => response.data);
    }
}

