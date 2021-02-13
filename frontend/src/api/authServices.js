import Configs from './config.js';
const API_URL = Configs.API_URL
console.log(Configs)


export default class AuthServices {
  constructor() { }

  async login(data) {

    const url = `${API_URL}/api/token_auth/`;
    console.log(API_URL)

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  }

  async getCurrentUser() {

    const token = localStorage.getItem('token');

    let result = {
      success: true,
      data: [],
    }

    const url = `${API_URL}/api/current_user/`;

    return fetch(url, {
      headers: {
        Authorization: `JWT ${token}`
      }
    })
      .then(res => res.json())
      .then(
        (json) => {
          console.log(json);
          if (json.detail === 'Signature has expired.') {
            console.log("GET NEW TOKEN")
            result.success = false;
          }
          if(json.detail === 'Error decoding signature.')
          {
            result.success = false;
          }
          result.data = json
          return result
        },
        (error) => {
          console.log(error)
          result.success = false;
          return result
        }
      )
  }
}