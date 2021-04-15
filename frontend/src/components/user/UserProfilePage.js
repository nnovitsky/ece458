import React from 'react';
import './UserProfilePage.css';
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';
import AuthServices from "../../api/authServices";
import UserServices from "../../api/userServices";
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import EditUserPopup from './EditUserPopup.js'
import ErrorsFile from "../../api/ErrorMapping/AdminErrors.json";
import { rawErrorsToDisplayed } from "../generic/Util";
import Button from 'react-bootstrap/Button';
import {PrivilegesDisplayMap} from '../generic/Util';


const authServices = new AuthServices();
const userServices = new UserServices();

class UserPage extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            logged_in: window.sessionStorage.getItem('token') ? true : false,
            userData: [],
            editUserPopup: {
                isShown: false,
                errors: []
            },
            groups:[],
        };

        this.onEditUserClosed = this.onEditUserClosed.bind(this);
        this.onEditUserSubmit = this.onEditUserSubmit.bind(this);
        this.getGroupsString = this.getGroupsString.bind(this);
    }



    async componentDidMount() {
        await this.updateUserInfo();
    }


    render() {
        let editUserPopup = (this.state.editUserPopup.isShown) ? this.makeEditProfilePopup() : null;
        return (
            <div>
                {editUserPopup}
                <div className="background">
                    <div className="row mainContent">
                        <div className="col-2 text-center">
                            <img src={logo} alt="Logo" />
                        </div>
                        <div className="col-10">
                            <h2>Hello, {`${this.state.userData.first_name} ${this.state.userData.last_name}`}</h2>
                            <div className="table-button-row col-3 alignButton">
                                <Button hidden={this.state.groups.includes('oauth')} onClick={this.onEditUserClicked}>Edit Information</Button>
                            </div>
                            <Row>
                                <Col xs={6}>
                                    {this.makeDetailsTable()}
                                </Col>
                                <Col xs={6}>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    makeEditProfilePopup() {
        return (
            <EditUserPopup
                isShown={this.state.editUserPopup.isShown}
                onSubmit={this.onEditUserSubmit}
                onClose={this.onEditUserClosed}
                errors={this.state.editUserPopup.errors}
            />
        )
    }


    onEditUserClosed() {
        this.setState({
            editUserPopup: {
                ...this.state.editUserPopup,
                isShown: false,
                errors: []
            }
        })
    }

    onEditUserClicked = () => {
        this.setState({
            editUserPopup: {
                ...this.state.addUserPopup,
                isShown: true
            }
        })
    }

    async onEditUserSubmit(updatedUser) {
        if(updatedUser.password === updatedUser.password_confirm) {
        userServices.editUser(updatedUser.password, updatedUser.first_name, updatedUser.last_name, [])
            .then((res) => {
                if (res.success) {
                    window.sessionStorage.setItem('token', res.data.token);
                    this.updateUserInfo();
                    this.onEditUserClosed();
                } else {
                    let formattedErrors = rawErrorsToDisplayed(res.errors, ErrorsFile['add_edit_user']);
                    this.setState({
                        editUserPopup: {
                            ...this.state.editUserPopup,
                            errors: formattedErrors
                        }
                    })
                }
            }
            );
        }
        else {
            this.setState({
                editUserPopup: {
                    ...this.state.editUserPopup,
                    errors: ["Passwords do not match"]
                }
            })
        }
    }

    async updateUserInfo() {
        authServices.getCurrentUser().then((result) => {
            if (result.success) {
                this.setState({
                    userData: result.data,
                    groups: result.data.groups
                })
            } else {
                console.log("error")
            }
        }
        )
    }

    async logInNewCredentials(data) {
        authServices.login(data)
            .then(res => res.json())
            .then(json => {
                if (typeof json.user === 'undefined') {
                    console.log("error");
                }
                else {
                    window.sessionStorage.setItem('token', json.token);
                    this.setState({
                        logged_in: true,
                    });
                }
            });
    }

    makeDetailsTable() {
        let userInfo = this.state.userData;
        return (
            <Table bordered hover>
                <tbody>
                    <tr>
                        <td><strong>Username</strong></td>
                        <td>{userInfo.username}</td>
                    </tr>
                    <tr>
                        <td><strong>Name</strong></td>
                        <td>{userInfo.first_name} {userInfo.last_name}</td>
                    </tr>
                    <tr>
                        <td><strong>Email</strong></td>
                        <td>{userInfo.email}</td>
                    </tr>
                    <tr>
                        <td><strong>Permissions</strong></td>
                        <td>{this.getGroupsString()}</td>
                    </tr>
                </tbody>
            </Table>
        )
    }

    getGroupsString()
    {
        let groupString = "";


        if(this.state.groups.length == 0 || (this.state.groups.length == 1 && this.state.groups.includes("oauth"))){
            groupString = "None";
        }
        else if(this.state.groups.length == 1){
            groupString = PrivilegesDisplayMap[this.state.groups[0]];
        }
        else{
            if(this.state.groups.includes("admin")) groupString = "Admin, ";
            if(this.state.groups.includes("models")) groupString = groupString + "Model, ";
            if(this.state.groups.includes("instruments")) groupString = groupString + "Instrument, ";
            if(this.state.groups.includes("calibration_approver")) groupString = groupString + "Cal, Approval, ";
            if(this.state.groups.includes("calibrations")) groupString = groupString + "Calibration";
        }
        return groupString;
    }

}

export default UserPage;