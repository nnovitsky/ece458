import React from 'react';
import UserServices from "../../api/userServices";
import GenericTable from '../generic/GenericTable';
import AddUserPopup from "./AddUserPopup";

import './Admin.css';
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';

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
            addUserPopup: {
                isShown: false,
            },
        };

        this.onAddUserClosed = this.onAddUserClosed.bind(this);
        this.onAddUserSubmit = this.onAddUserSubmit.bind(this);
    }

    

    async componentDidMount() {
        this.updateUserTable();
    }

    render() {
        return (
            <div>
                <AddUserPopup
                    isShown={this.state.addUserPopup.isShown}
                    onSubmit={this.onAddUserSubmit}
                    onClose={this.onAddUserClosed}
                />

                <div className="background">
                    <div className="row mainContent">
                        <div className="col-2 text-center">
                            <img src={logo} alt="Logo" />
                        </div>
                        <div className="col-10">
                            <h2>Hello, Admin</h2>
                            <GenericTable data={this.state.tableData} keys={keys} headers={headers} buttonText={[]} buttonFunctions={[]} />
                            <button onClick={this.onAddUserClicked}>Add New User</button>
                        </div>
                    </div>
                </div>
            </div>

        );
    }

    async onAddUserSubmit(newUser) {
        console.log("New user added")
        console.log(newUser);
        userServices.addUser(newUser.username, newUser.password, newUser.first_name, newUser.last_name, newUser.email)
            .then((res) => {
                this.updateUserTable();
                this.onAddUserClosed();
            }
            );

    }

    onAddUserClosed() {
        this.setState({
            addUserPopup: {
                ...this.state.addUserPopup,
                isShown: false
            }
        })
    }

    onAddUserClicked = () => {
        this.setState({
            addUserPopup: {
                ...this.state.addUserPopup,
                isShown: true
            }
        })
    }





    onUserDeleted = e => {
        console.log("Delete user");
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

}

export default AdminPage;