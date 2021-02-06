import React from 'react';
import modelData from './modelData.json';
import axios from 'axios';

const API_URL = 'https://localhost:8000';

export default class ModelServices {
    constructor() { }

    getModels() {

        const url = `${API_URL}/api/models`;
        // axios.get(url).then(response => response.data).then(response => console.log(response));
        fetch(url)
            .then(res => res.json())
            .then(
                (result) => {
                    console.log(`Success: ${result}`)
                },
                (error) => {
                    console.log(`Error: ${error}`)
                }
            )
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

    getAllDescriptions() {
        let result = new Set();
        modelData.getModels.forEach(el => {
            result.add(el["description"]);
        })
        return Array.from(result);
    }

    getAllCallibrationFrequencies() {
        let result = new Set();
        modelData.getModels.forEach(el => {
            result.add(el["callibration frequency"]);
        })
        return Array.from(result);
    }
}

