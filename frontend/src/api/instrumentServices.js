import React from 'react';
import instrumentData from './instrumentData.json.json';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export default class InstrumentServices {
    constructor() { }

    getInstruments() {
        return instrumentData.instruments;
        // const url = `${API_URL}/api/models/`;
        // return axios.get(url).then(response => response.data);
    }

    getInstrumentSerialByModel(modelPk) {
        let result = [];
        instrumentData.instruments.forEach(element => {
            if (el.model["model pk"] == modelPk) {
                let temp = {
                    "serial": el["serial"],
                    "pk": el["instrument pk"]
                }
            }
        });
        return result;
        // const url = `${API_URL}/api/customers/${pk}`;
        // return axios.get(url).then(response => response.data);
    }
}

