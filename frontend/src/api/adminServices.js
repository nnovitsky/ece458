import Configs from './config.js';
import { checkBadResponse } from './apiUtil';
const API_URL = Configs

export default class AdminServices {

    // handles modified/expired token
    async addAdminPriviledges(user_pk) {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: true,
            data: [],
        }

        let url = `${API_URL}/api/toggle_admin/${user_pk}/`;
        return fetch(url, {
            method: 'PUT',
            headers: {
                Authorization: `JWT ${token}`
            },
        })
            .then(res => {
                if (res.ok) {
                    return res.json().then(json => {
                        result.data = json;
                        return result;
                    });
                } else {
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            })
    }


    async removeAdminPriviledges(user_pk) {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: false,
            data: [],
        }

        let url = `${API_URL}/api/toggle_admin/${user_pk}/`;
        return fetch(url, {
            method: 'DELETE',
            headers: {
                Authorization: `JWT ${token}`
            },
        })
            .then(res => {
                if (res.ok) {
                    return res.json().then(json => {
                        result.success = true;
                        result.data = json;
                        return result;
                    });
                } else {
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            })
    }

    async deleteUser(user_pk){
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: false,
            data: [],
        }

        let data = {
            delete_user: user_pk,
        }

        let url = `${API_URL}/api/users/`;
        return fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                console.log(res)
                if (res.ok) {
                        result.success = true;
                        return result;
                } else {
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            })
    }



    async togglePriviledges(user_pk, groups_array) {
        const token = window.sessionStorage.getItem('token');

        let data = {
            groups: groups_array,
        }

        let result = {
            success: false,
            data: [],
        }

        let url = `${API_URL}/api/toggle_groups/${user_pk}/`;
        return fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${token}`
            },
            body: JSON.stringify(data)
        })
            .then(res => {
                if (res.ok) {
                    return res.json().then(json => {
                        result.success = true;
                        result.data = json;
                        return result;
                    });
                } else {
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            })
    }



    async getPriviledgeList() {
        const token = window.sessionStorage.getItem('token');

        let result = {
            success: false,
            data: [],
        }

        let url = `${API_URL}/api/permissions_list/`;
        return fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `JWT ${token}`
            },
        })
            .then(res => {
                if (res.ok) {
                    return res.json().then(json => {
                        result.success = true;
                        result.data = json;
                        return result;
                    });
                } else {
                    return res.json().then(async (json) => {
                        return await checkBadResponse(json, result);
                    });
                }
            })
    }
}
