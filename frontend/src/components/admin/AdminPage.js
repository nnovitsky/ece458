import React from 'react';
import { useHistory } from "react-router-dom";
import UserServices from "../../api/userServices";
import GenericTable from '../generic/GenericTable';

import './Admin.css';
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';

let history;
const userServices = new UserServices();

const keys = ["username", "first_name", "last_name", "email"];
const headers = ["Username", "First Name", "Last Name", "Email"];


class AdminPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            logged_in: localStorage.getItem('token') ? true : false,
            username: '',
            tableData: [],
        };
    }

    async componentDidMount() {
        this.updateUserTable();
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
                    <GenericTable data={this.state.tableData} keys={keys} headers={headers} buttonText={[]} buttonFunctions={[]} />
                    <button onClick={this.addNewUser}>Add New User</button>
                </div>
            </div>
            </div>

        );
    }

    async updateUserTable() {
        userServices.getUsers().then((result) => {
            if (result.success) {
                this.setState({
                    redirect: null,
                    tableData: result.data
                })
            } else {
                console.log("error")
            }
        }
        )
    }

    addNewUser = e => {
        console.log("Add new user");
    }


    onUserDeleted = e =>  {
        console.log("Delete user");
    }

}

export default AdminPage;