import React from 'react';
import UserServices from "../../api/userServices";
import GenericTable from '../generic/GenericTable';
import AddUserPopup from "./AddUserPopup";

import './Admin.css';
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';
import GenericPagination from "../generic/GenericPagination";
import ErrorsFile from "../../api/ErrorMapping/AdminErrors.json";
import { rawErrorsToDisplayed } from '../generic/Util';

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
                resultCount: '',
                numPages: '',
                resultsPerPage: 10,
                currentPageNum: '',
                desiredPage: '1',
                showAll: false
            }
        };

        this.onAddUserClosed = this.onAddUserClosed.bind(this);
        this.onAddUserSubmit = this.onAddUserSubmit.bind(this);
        this.onPaginationClick = this.onPaginationClick.bind(this);
        this.onToggleShowAll = this.onToggleShowAll.bind(this);
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
                            <GenericTable data={this.state.tableData} keys={keys} headers={headers} buttonText={[]} buttonFunctions={[]} />
                            <GenericPagination
                                currentPageNum={this.state.user_pagination.currentPageNum}
                                numPages={this.state.user_pagination.numPages}
                                numResults={this.state.user_pagination.resultCount}
                                resultsPerPage={this.state.user_pagination.resultsPerPage}
                                onPageClicked={this.onPaginationClick}
                                onShowAllToggle={this.onToggleShowAll}
                                isShown={!this.state.user_pagination.showAll}
                                buttonText={(this.state.user_pagination.showAll) ? "Limit Results" : "Show All"}
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

    async updateUserTable() {
        userServices.getUsers(this.state.user_pagination.desiredPage, this.state.user_pagination.showAll).then((result) => {
            if (result.success) {
                this.setState({
                    redirect: null,
                    tableData: result.data.data
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

    async onPaginationClick(num) {
        this.setState({
            user_pagination: {
                ...this.state.user_pagination,
                desiredPage: num
            }
        }, () => {
            this.updateUserTable();
        })
    }

    async onToggleShowAll() {
        this.setState((prevState) => {
            return {
                user_pagination: {
                    ...this.state.user_pagination,
                    showAll: !prevState.user_pagination.showAll
                }
            }
        }, () => {
            this.updateUserTable();
        })
    }

}

export default AdminPage;