import React from 'react';
import UserServices from "../../api/userServices.js";
import AdminServices from "../../api/adminServices.js";
import AuthServices from "../../api/authServices.js";
import AddUserPopup from "./AddUserPopup";
import DeletePopup from '../generic/GenericPopup';

import LogoTitleHeader from '../generic/LogoTitleHeader';
import './Admin.css';
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';
import ErrorsFile from "../../api/ErrorMapping/AdminErrors.json";
import { rawErrorsToDisplayed } from '../generic/Util';
import UserTable from './UserTable';
import Button from 'react-bootstrap/Button';

const userServices = new UserServices();
const adminServices = new AdminServices();
const authServices = new AuthServices();


class AdminPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            logged_in: window.sessionStorage.getItem('token') ? true : false,
            username: '',
            tableData: [],
            addUserPopup: {
                isShown: false,
                errors: []
            },
            user_pagination: {
                resultCount: 0,
                numPages: 1,
                resultsPerPage: 25,
                currentPageNum: 1,
                desiredPage: 1,
                showAll: false
            },
            deletePopupIsShown: false,
            userDeleted: {
                pk: null,
                name: ''
            }
        };

        this.onAddUserClosed = this.onAddUserClosed.bind(this);
        this.onAddUserSubmit = this.onAddUserSubmit.bind(this);
        this.onUserTableChange = this.onUserTableChange.bind(this);
        this.giveAdminPriviledges = this.giveAdminPriviledges.bind(this);
        this.revokeAdminPriviledges = this.revokeAdminPriviledges.bind(this);
        this.getUsername = this.getUsername.bind(this);
        this.onUserDelete = this.onUserDelete.bind(this);
        this.onDeleteClicked = this.onDeleteClicked.bind(this);
        this.onDeleteClose = this.onDeleteClose.bind(this);
        this.changePrivileges = this.changePrivileges.bind(this);
    }



    async componentDidMount() {
        this.getUsername();
        this.updateUserTable();
    }

    render() {
        let buttonRow = (<div className="table-button-row">
            <Button onClick={this.onAddUserClicked}>Add New User</Button>
            <span>(Hover over a cell for more information)</span>
        </div>)

        let deletePopup = (this.state.deletePopupIsShown) ? this.makeDeletePopup() : null;
        let addUserPopup = (this.state.addUserPopup.isShown) ? this.makeAddUserPopup() : null;
        return (
            <div>
                {deletePopup}
                {addUserPopup}

                <div className="background">
                    <div className="row mainContent">
                        <LogoTitleHeader
                            title='Hello, Administrator'
                            headerButtons={null}
                        />
                        <div className="user-table-div">
                            <UserTable
                                data={this.state.tableData}
                                onTableChange={this.onUserTableChange}
                                pagination={{ page: this.state.user_pagination.currentPageNum, sizePerPage: (this.state.user_pagination.showAll ? this.state.user_pagination.resultCount : this.state.user_pagination.resultsPerPage), totalSize: this.state.user_pagination.resultCount }}
                                inlineElements={buttonRow}
                                giveAdminPriviledges={this.giveAdminPriviledges}
                                revokeAdminPriviledges={this.revokeAdminPriviledges}
                                currentUser={this.props.username}
                                deleteUser={this.onDeleteClicked}
                                onChangePrivileges={this.changePrivileges}
                            />
                        </div>
                            
                    </div>
                </div>
            </div>

        );
    }

    makeDeletePopup() {
        let body = (
            <p>Are you sure you would like to delete <b>{this.state.userDeleted.name}</b>?</p>
        )
        return (
            <DeletePopup
                show={this.state.deletePopupIsShown}
                body={body}
                headerText="Warning!"
                closeButtonText="Cancel"
                submitButtonText="Delete"
                submitButtonVariant="danger"
                onClose={this.onDeleteClose}
                onSubmit={this.onUserDelete}
            />
        )
    }

    makeAddUserPopup() {
        return (
            <AddUserPopup
                isShown={this.state.addUserPopup.isShown}
                onSubmit={this.onAddUserSubmit}
                onClose={this.onAddUserClosed}
                errors={this.state.addUserPopup.errors}
            />
        )
    }

    onDeleteClose() {
        this.setState({
            deletePopupIsShown: false
        })
    }

    onDeleteClicked(e) {
        let pk = Number(e.target.value)
        let name = e.target.name
        this.setState({
            deletePopupIsShown: true,
            userDeleted: {
                ...this.state.addUserPopup,
                pk: pk,
                name: name
            }
        })
        console.log(pk)
        console.log(name)
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


    async onUserDelete() {
        console.log(this.state.userDeleted.pk)
         adminServices.deleteUser(this.state.userDeleted.pk).then(result => {
            if (result.success) {
                this.setState({
                    deletePopupIsShown: false,
                })
                this.updateUserTable();
            }
        }) 
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
                            resultsPerPage: sizePerPage,
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
        userServices.getUsers(this.state.user_pagination.desiredPage, this.state.user_pagination.showAll, this.state.user_pagination.resultsPerPage).then((result) => {
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
                } else {
                    this.setState({
                        user_pagination: {
                            ...this.state.user_pagination,
                            currentPageNum: 1
                        }
                    })
                }
            } else {
                console.log("error")
            }
        }
        )
    }

    async giveAdminPriviledges(e) {
        let pk = e.target.value
        adminServices.addAdminPriviledges(pk).then(result => {
            if (result.success) {
                this.updateUserTable()
            }
            else {

            }
        })
    }


    async revokeAdminPriviledges(e) {
        let pk = e.target.value
        adminServices.removeAdminPriviledges(pk).then(result => {
            if (result.success) {
                this.updateUserTable()
            }
            else {

            }
        })
    }

    async getUsername() {
        authServices.getCurrentUser().then((result) => {
            if (result.success) {
                this.setState({
                    username: result.data.username,
                })
            } else {
                window.sessionStorage.clear();
                this.setState({
                    logged_in: false,
                    username: '',
                });
            }
        }
        )
    }


    async changePrivileges(e)
    {
        console.log(e)
        adminServices.togglePriviledges(e.pk, e.groups).then(result =>{
            console.log(result)
            this.updateUserTable()
        })
    }  
}

export default AdminPage;