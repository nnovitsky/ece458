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


const AdminPage = () => {

    let data = userServices.getUsers();
    let buttonFunctions = [onUserDeleted]
    history = useHistory(data);

        return (
            <div className="column-div">
                <div className="left-column">
                    <img src={logo} alt="Logo" />
                </div>
                <div className="main-div">
                    <h2>Hello, Admin</h2>
                    <GenericTable data={data} keys={keys} headers={headers} buttonText={buttonText} buttonFunctions={buttonFunctions} />
                    <button onClick={addNewUser}>Add New User</button>
                </div>
            </div>


        );
}

const onUserDeleted= (e) => {
    console.log("Delete user");
}

const addNewUser = (e) => {
    console.log("Add new user");
}

export default AdminPage;