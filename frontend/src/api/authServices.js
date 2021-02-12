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

  // handles modified/expired token
  async getCurrentUser() {
    const token = localStorage.getItem('token');

    let result = {
      success: true,
      data: [],
    }

    const url = `${API_URL}/current_user/`;

    return fetch(url, {
      headers: {
        Authorization: `JWT ${token}`
      }
    })
      .then(res => {
        if (res.ok) {
          return res.json().then(json => {
            result.data = json;
            return result;
          });
        } else {
          return res.json().then(json => {
          if (json.detail === 'Signature has expired.') {
            window.location.reload();
            result.success = false;
            return result;
          }
            if (json.detail === 'Error decoding signature.') {
              window.location.reload();
            result.success = false;
              return result;
            }
          result.success = false;
            result.errors = json;
            return result;
          })
      }
      })
    }
}