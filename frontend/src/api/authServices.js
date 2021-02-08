import React from 'react';
import userData from './userData.json';
import axios from 'axios';

const API_URL = 'http://localhost:8000';


export default class AuthServices {
    constructor() { }

    async login(data) {
      return fetch('http://localhost:8000/token_auth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    }

    async getCurrentUser(token) {

      return fetch('http://localhost:8000/current_user/', {
        headers: {
          Authorization: `JWT ${token}`
        }
      });
    }
}