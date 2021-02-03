import React from 'react';
import modelData from './modelData.json';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export default class ModelServices {
    constructor() { }

    getModels() {
        return modelData.getModels;
        // const url = `${API_URL}/api/models/`;
        // return axios.get(url).then(response => response.data);
    }

    getModel(pk) {
        return modelData.modelsByKey[pk];
        // const url = `${API_URL}/api/customers/${pk}`;
        // return axios.get(url).then(response => response.data);
    }

    getAllModelNumbers() {
        let result = new Set();
        modelData.getModels.forEach(el => {
            result.add(el["model number"]);
        })
        return Array.from(result);
    }

    getAllVendors() {
        let result = new Set();
        modelData.getModels.forEach(el => {
            result.add(el["vendor"]);
        })
        return Array.from(result);
    }
}

