import React from 'react';
import instrumentData from './instrumentData.json';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export default class InstrumentServices {
    constructor() { }

    getInstruments() {
        return instrumentData.instruments;
        // const url = `${API_URL}/api/models/`;
        // return axios.get(url).then(response => response.data);
    }

    getInstrument(instrumentPk) {
        let result;
        instrumentData.instruments.forEach(el => {
            if (el["instrument pk"] === instrumentPk) {
                result = el;
            }
        });
        return result;
    }

    getInstrumentSerialByModel(modelPk) {
        let result = [];
        instrumentData.instruments.forEach(el => {
            if (el["model pk"] === modelPk) {
                let temp = {
                    "serial": el["serial"],
                    "pk": el["instrument pk"]
                }
                result.push(temp);
            }
        });
        return result;
        // const url = `${API_URL}/api/customers/${pk}`;
        // return axios.get(url).then(response => response.data);
    }

    getAllSerialNumbers() {
        let result = new Set();
        instrumentData.instruments.forEach(el => {
            result.add(el["serial"]);
        })
        return Array.from(result);
    }
}

