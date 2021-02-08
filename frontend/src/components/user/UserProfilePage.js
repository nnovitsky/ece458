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

const authServices = new AuthServices();
const userServices = new UserServices();

class UserPage extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            logged_in: localStorage.getItem('token') ? true : false,
            userData: [],
            editUserPopup: {
                isShown: false,
            },
        };

        this.onEditUserClosed = this.onEditUserClosed.bind(this);
        this.onEditUserSubmit = this.onEditUserSubmit.bind(this);
    }



    async componentDidMount() {
        this.updateUserInfo();
    }


    render() {
        return (
            <div>
                <EditUserPopup
                    isShown={this.state.editUserPopup.isShown}
                    onSubmit={this.onEditUserSubmit}
                    onClose={this.onEditUserClosed}
                />
            <div className="background">
                <div className="row mainContent">
                    <div className="col-2 text-center">
                        <img src={logo} alt="Logo" />
                    </div>
                    <div className="col-10">
                        <h2>Hello, {this.state.userData.username}</h2>
                        <Row>
                            <Col xs={6}>
                            {this.makeDetailsTable()}
                            </Col>
                            <Col xs={6}>
                            <button onClick={this.onEditUserClicked}>Edit Information</button>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
            </div>
        );
    }


    onEditUserClosed() {
        this.setState({
            editUserPopup: {
                ...this.state.editUserPopup,
                isShown: false
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
        userServices.editUser(updatedUser.username, updatedUser.password, updatedUser.first_name, updatedUser.last_name)
                    .then((res) => {
                        this.updateUserInfo();
                        this.onEditUserClosed();
                    }
        );
    }

    async updateUserInfo() {
        authServices.getCurrentUser().then((result) => {
            if (result.success) {
              this.setState({ 
                userData: result.data
              })
            } else {
                console.log("error")
            }
        }
        )
    }

    makeDetailsTable() {
        let userInfo = this.state.userData;
        return (
            <Table bordered hover>
                <tbody>
                    <tr>
                        <td><strong>User Name</strong></td>
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
                </tbody>
            </Table>
        )
    }

}

export default UserPage;