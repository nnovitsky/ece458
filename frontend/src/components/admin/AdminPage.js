import React from 'react';
import { useHistory } from "react-router-dom";
import UserServices from "../../api/userServices";
import GenericTable from '../generic/GenericTable';

import './Admin.css';
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';

let history;
const userServices = new UserServices();

const keys = ["display name", "email", "password"];
const headers = ["Display Name", "Email", "Password", "Remove User"];
const buttonText = ["Delete"];

let data = userServices.getUsers();


class AdminPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            logged_in: localStorage.getItem('token') ? true : false,
            username: ''
        };
    }

    componentDidMount() {

        
    }

    addNewUser = e => {
        console.log("Add new user");
    }

    onUserDeleted = e =>  {
        console.log("Delete user");
    }

    render() {
        return (
            <div className="background">
            <div className="row mainContent">
                <div className="col-2 text-center">
                    <img src={logo} alt="Logo" />
                </div>
                <div className="col-10">
                    <h2>Hello, Admin</h2>
                    <GenericTable data={data} keys={keys} headers={headers} buttonText={buttonText} buttonFunctions={[this.onUserDeleted]} />
                    <button onClick={this.addNewUser}>Add New User</button>
                </div>
            </div>
            </div>

        );
    }

}

export default AdminPage;