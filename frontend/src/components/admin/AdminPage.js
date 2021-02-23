import React from 'react';
import UserServices from "../../api/userServices";
import AddUserPopup from "./AddUserPopup";

import './Admin.css';
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';
import ErrorsFile from "../../api/ErrorMapping/AdminErrors.json";
import { rawErrorsToDisplayed } from '../generic/Util';
import UserTable from './UserTable';

const userServices = new UserServices();

const keys = ["$.username", "$.first_name", "$.last_name", "$.email"];
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
                errors: []
            },
            user_pagination: {
                resultCount: 0,
                numPages: 1,
                resultsPerPage: 10,
                currentPageNum: 1,
                desiredPage: 1,
                showAll: false
            }
        };

        this.onAddUserClosed = this.onAddUserClosed.bind(this);
        this.onAddUserSubmit = this.onAddUserSubmit.bind(this);
        this.onUserTableChange = this.onUserTableChange.bind(this);
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
                    errors={this.state.addUserPopup.errors}
                />

                <div className="background">
                    <div className="row mainContent">
                        <div className="col-2 text-center">
                            <img src={logo} alt="Logo" />
                        </div>
                        <div className="col-10">
                            <h2>Hello, Admin</h2>
                            <UserTable
                                data={this.state.tableData}
                                onTableChange={this.onUserTableChange}
                                pagination={{ page: this.state.user_pagination.currentPageNum, sizePerPage: (this.state.user_pagination.showAll ? this.state.user_pagination.resultCount : this.state.user_pagination.resultsPerPage), totalSize: this.state.user_pagination.resultCount }}
                            />
                            <button onClick={this.onAddUserClicked}>Add New User</button>
                        </div>
                    </div>
                </div>
            </div>

        );
    }

    async onAddUserSubmit(newUser) {
        userServices.addUser(newUser.username, newUser.password, newUser.first_name, newUser.last_name, newUser.email)
            .then((res) => {
                if (res.success) {
                    this.updateUserTable();
                    this.onAddUserClosed();
                } else {
                    let formattedErrors = rawErrorsToDisplayed(res.errors, ErrorsFile['add_edit_user']);
                    this.setState({
                        addUserPopup: {
                            ...this.state.addUserPopup,
                            errors: formattedErrors
                        }
                    })
                }

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

    // event handler for the User Table, it handles pagination
    onUserTableChange(type, { page, sizePerPage }) {
        switch (type) {
            case 'pagination':
                if (sizePerPage === this.state.user_pagination.resultCount) {
                    this.setState({
                        user_pagination: {
                            ...this.state.user_pagination,
                            desiredPage: 1,
                            showAll: true,
                        }
                    }, () => {
                        this.updateUserTable();
                    })
                } else {
                    this.setState({
                        user_pagination: {
                            ...this.state.user_pagination,
                            desiredPage: page,
                            showAll: false,
                        }
                    }, () => {
                        this.updateUserTable();
                    })
                }
            default:
                console.log(`User table does not support this: ${type} feature`);
                return;
        }
    }

    async updateUserTable() {
        userServices.getUsers(this.state.user_pagination.desiredPage, this.state.user_pagination.showAll).then((result) => {
            if (result.success) {
                this.setState({
                    redirect: null,
                    tableData: result.data.data,
                    user_pagination: {
                        ...this.state.user_pagination,
                        resultCount: result.data.count
                    }
                })

                if (!this.state.user_pagination.showAll) {
                    this.setState({
                        user_pagination: {
                            ...this.state.user_pagination,
                            resultCount: result.data.count,
                            numPages: result.data.numpages,
                            currentPageNum: result.data.currentpage
                        }
                    })
                }
            } else {
                console.log("error")
            }
        }
        )
    }
}

export default AdminPage;