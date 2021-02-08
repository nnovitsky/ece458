const API_URL = 'http://localhost:8000';


export default class AuthServices {
    constructor() { }

    async login(data) {

      const url = `${API_URL}/token_auth/`;

      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    }

    async getCurrentUser(token) {

      const url = `${API_URL}/current_user/`;

      return fetch(url, {
        headers: {
          Authorization: `JWT ${token}`
        }
      });
    }
}