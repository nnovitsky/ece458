import React from 'react';
import './UserProfilePage.css';
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';
import AuthServices from "../../api/authServices";
import UserServices from "../../api/userServices";
import InstrumentServices from "../../api/instrumentServices";
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import EditUserPopup from './EditUserPopup.js'
import ErrorsFile from "../../api/ErrorMapping/AdminErrors.json";
import { rawErrorsToDisplayed, hasApprovalAccess, nameAndDownloadFile } from "../generic/Util";
import Button from 'react-bootstrap/Button';
import {PrivilegesDisplayMap} from '../generic/Util';
import CalHistoryTable from '../instrument/CalHistoryTable';
import ErrorFile from "../../api/ErrorMapping/InstrumentErrors.json";
import CalibrationPopup from '../instrument/CalibrationPopup';
import GuidedCal from '../guidedCal/GuidedCal';
import Wizard from '../wizard/Wizard';


const authServices = new AuthServices();
const userServices = new UserServices();
const instrumentServices = new InstrumentServices();

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
            calibrationData: [],
            calibration_pagination: {
                resultCount: 0,
                numPages: 1,
                resultsPerPage: 25,
                currentPageNum: 1,
                isShowAll: false,
                desiredPage: 1
            },
            wizardPopup: {
                isShown: false,
                lbPK: null,
            },
            guidedCalPopup: {
                isShown: false,
                pk: null,
            },
            formCalPopup: {
                isShown: false,
                pk: null,
            },
            displayFormCalPopup: {
                isShown: false,
                pk: null,
            },
            calibrationPopup: {
                isShown: false,
                calEvent: null,
                isApprovalForm: true,
                errors: [],
            },
        };

        this.onEditUserClosed = this.onEditUserClosed.bind(this);
        this.onEditUserSubmit = this.onEditUserSubmit.bind(this);
        this.getGroupsString = this.getGroupsString.bind(this);

        this.onSupplementDownloadClicked = this.onSupplementDownloadClicked.bind(this);
        this.onLoadBankClick = this.onLoadBankClick.bind(this);
        this.onKlufeClick = this.onKlufeClick.bind(this);
        this.onShowCalibrationPopup = this.onShowCalibrationPopup.bind(this);
        this.onCalibrationPopupApprovalSubmit = this.onCalibrationPopupApprovalSubmit.bind(this);
        this.onCalibrationPopupClose = this.onCalibrationPopupClose.bind(this);

        this.onWizardClose = this.onWizardClose.bind(this);
        this.makeWizardPopup = this.makeWizardPopup.bind(this);

        this.makeGuidedCalPopup = this.makeGuidedCalPopup.bind(this);
        this.onGuidedCalClose = this.onGuidedCalClose.bind(this);
        this.onCalHistoryTableChange = this.onCalHistoryTableChange.bind(this);
    }



    async componentDidMount() {
        await this.updateUserInfo();
        await this.updatePendingTable();
    }


    render() {
        let editUserPopup = (this.state.editUserPopup.isShown) ? this.makeEditProfilePopup() : null;
        let pendingTable = hasApprovalAccess(this.state.groups) ? this.makeCalHistoryTable() : null;
        const calibrationPopup = this.state.calibrationPopup.isShown ? this.makeCalibrationPopup() : null;
        let wizardPopup = (this.state.wizardPopup.isShown) ? this.makeWizardPopup() : null;
        let guidedCalPopup = (this.state.guidedCalPopup.isShown) ? this.makeGuidedCalPopup() : null;
        let formCalPopup = (this.state.formCalPopup.isShown) ? this.makeFormCalPopup() : null;
        let displayFormCalPopup = (this.state.displayFormCalPopup.isShown) ? this.makeDisplayFormCalPopup() : null;
        return (
            <div>
                {editUserPopup}
                {wizardPopup}
                {guidedCalPopup}
                {formCalPopup}
                {displayFormCalPopup}
                {calibrationPopup}
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
                        {pendingTable}
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
        await authServices.getCurrentUser().then((result) => {
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

    async updatePendingTable() {
        const pagination = this.state.calibration_pagination;
        await instrumentServices.getAllPendingCalEvents(pagination.desiredPage, pagination.isShowAll, pagination.resultsPerPage).then((result) => {
            console.log(result);
            if(result.success) {
                this.setState({
                    calibrationData: result.data.data,
                    calibration_pagination: {
                        ...this.state.calibration_pagination,
                        resultCount: result.data.count
                    }
                })
            }
            if (!this.state.calibration_pagination.isShowAll) {
                this.setState({
                    calibration_pagination: {
                        ...this.state.calibration_pagination,
                        resultCount: result.data.count,
                        numPages: result.data.numpages,
                        currentPageNum: result.data.currentpage,
                    }
                });
            } else {
                this.setState({
                    calibration_pagination: {
                        ...this.state.calibration_pagination,
                        currentPageNum: 1
                    }
                })
            }
        })
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
            if(this.state.groups.includes("calibration_approver")) groupString = groupString + "Cal. Approval, ";
            if(this.state.groups.includes("calibrations")) groupString = groupString + "Calibration";
        }
        return groupString;
    }

    makeCalibrationPopup() {
        return (
            <CalibrationPopup
                calibrationEvent={this.state.calibrationPopup.calEvent}
                currentUser={this.state.userData}
                isApprovalForm={true}
                isShown={this.state.calibrationPopup.isShown}
                onClose={this.onCalibrationPopupClose}
                onSubmit={this.onCalibrationPopupApprovalSubmit}
                errors={this.state.calibrationPopup.errors}
                onSupplementDownload={this.onSupplementDownloadClicked}
                onLoadBankClick={this.onLoadBankClick}
                onKlufeClick={this.onKlufeClick}

            />
        )
    }

    makeGuidedCalPopup() {
        return (
            <GuidedCal
                isShown={this.state.guidedCalPopup.isShown}
                onClose={this.onGuidedCalClose}
                klufePK={this.state.guidedCalPopup.pk}
                user={this.state.userData}
                model_number={null}
                vendor={null}
                serial_number={null}
                instrument_pk={null}
                asset_tag={null}

            />
        )
    }

    makeWizardPopup() {
        return (
            <Wizard
                isShown={this.state.wizardPopup.isShown}
                onClose={this.onWizardClose}
                model_number={null}
                vendor={null}
                serial_number={null}
                instrument_pk={null}
                asset_tag={null}
                lb_pk={this.state.wizardPopup.lbPK}
                user={this.state.userData}
            />
        )
    }

    makeCalHistoryTable() {
        return(
            <div>
                <h3>Calibration Events Pending Approval {`(${this.state.calibration_pagination.resultCount})`}</h3>
                <CalHistoryTable
                    data={this.state.calibrationData}
                    onTableChange={this.onCalHistoryTableChange}
                    pagination={
                        {
                            page: this.state.calibration_pagination.currentPageNum,
                            sizePerPage: (this.state.calibration_pagination.isShowAll ? this.state.calibration_pagination.resultCount : this.state.calibration_pagination.resultsPerPage),
                            totalSize: this.state.calibration_pagination.resultCount
                        }}
                    onSupplementDownload={this.onSupplementDownloadClicked}
                    onLoadBankClick={this.onLoadBankClick}
                    onKlufeClick={this.onKlufeClick}
                    onFormClick={this.onDisplayFormCalClicked}
                    requiresApproval={true}
                    onRowClick={this.onShowCalibrationPopup}
                    hasApprovalPermissions={true}
                    inlineElements="(Click on a row for more information)"
                />
            </div>
        )
    }

    async onCalHistoryTableChange(type, { page, sizePerPage }) {
        switch (type) {
            case 'pagination':
                if (sizePerPage === this.state.calibration_pagination.resultCount) {
                    this.setState({
                        calibration_pagination: {
                            ...this.state.calibration_pagination,
                            desiredPage: 1,
                            isShowAll: true,
                        }
                    }, () => {
                        this.updatePendingTable();
                    })
                } else {
                    this.setState({
                        calibration_pagination: {
                            ...this.state.calibration_pagination,
                            desiredPage: page,
                            isShowAll: false,
                            resultsPerPage: sizePerPage,
                        }
                    }, () => {
                        this.updatePendingTable();
                    })
                }
                return;
            default:
                return;
        }
    }

    async onSupplementDownloadClicked(e) {
        let cal_pk = e.target.value;
        instrumentServices.getCalEventFile(cal_pk)
            .then((result) => {
                if (result.success) {
                    nameAndDownloadFile(result.url, `supplement-file`, result.type);
                } else {
                    console.log('no file exists');
                }
            })
    }

    onLoadBankClick(e) {
        this.setState({
            wizardPopup: {
                ...this.state.wizardPopup,
                isShown: true,
                lbPK: e.target.value
            }
        })
    }

    onKlufeClick(e) {
        this.setState({
            guidedCalPopup: {
                ...this.state.guidedCalPopup,
                isShown: true,
                pk: e.target.value
            }
        })
    }

    onShowCalibrationPopup(calEvent) {
        console.log('click');
        const isApprover = hasApprovalAccess(this.state.groups);
        this.setState({
            calibrationPopup: {
                ...this.state.calibrationPopup,
                isShown: true,
                calEvent: calEvent,
                isApprovalForm: (isApprover && calEvent.approval_status === 'Pending')
            }
        })
    }

    onCalibrationPopupClose() {
        this.setState({
            calibrationPopup: {
                ...this.state.calibrationPopup,
                isShown: false,
                calEvent: null,
            }
        })
    }

    async onCalibrationPopupApprovalSubmit(comment, isApproved) {
        await instrumentServices.setCalEventApproval(this.state.calibrationPopup.calEvent.pk, comment, isApproved).then((result) => {
            if (result.success) {
                this.updatePendingTable();
                this.onCalibrationPopupClose();
            } else {
                let formattedErrors = rawErrorsToDisplayed(result.errors, ErrorFile["add_calibration"]);
                this.setState({
                    calibrationPopup: {
                        ...this.state.calibrationPopup,
                        errors: formattedErrors
                    }
                })
            }
        })
    }

    onGuidedCalClose() {
        this.setState({
            guidedCalPopup: {
                ...this.state.guidedCalPopup,
                isShown: false,
                pk: null,
            }
        })
    }

    onWizardClose() {
        this.setState({
            wizardPopup: {
                ...this.state.wizardPopup,
                isShown: false,
                lbPK: null,
            }
        })
    }

    

}

export default UserPage;