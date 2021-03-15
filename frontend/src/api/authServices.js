import Configs from './config.js';
const API_URL = Configs


export default class AuthServices {

  async login(data) {

    const url = `${API_URL}/api/token_auth/`;

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
    const token = window.sessionStorage.getItem('token');

    let result = {
      success: true,
      data: [],
      admin: false,
    }

    const url = `${API_URL}/api/current_user/`;

    return fetch(url, {
      headers: {
        Authorization: `JWT ${token}`
      }
    })
      .then(res => {
        if (res.ok) {
          return res.json().then(json => {
            result.data = json;
            result.admin = json.groups.includes("admin");
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


    async getOauthToken(code) {
      
      const url = `${API_URL}/api/oauth/consume/?code=${code}`;

      let result = {
        success: false,
        data: [],
        admin: false,
      }
      

      return fetch(url).then(res =>{
        if(res.ok){
          return res.json().then(json => {
            result.success = true;
            result.data = json;
            result.admin = json.user.groups.includes("admin")
            return result;
          });
        }
        else{
          result.success = false;
          return result;
        }
      }
      )
    }
}