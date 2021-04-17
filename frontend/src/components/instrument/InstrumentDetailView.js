import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { Link, Redirect, withRouter } from "react-router-dom";

import AddCalibrationPopup from './AddCalibrationPopup';
import EditInstrumentPopop from './AddInstrumentPopup';
import DeletePopup from '../generic/GenericPopup';
import Wizard from '../wizard/Wizard.js';
import GuidedCal from '../guidedCal/GuidedCal.js';
import FormCal from '../formCal/FormCal.js';
import DisplayFormCal from '../formCal/FormDisplay.js';
import ErrorFile from "../../api/ErrorMapping/InstrumentErrors.json";
import { rawErrorsToDisplayed, nameAndDownloadFile, dateToString, hasInstrumentEditAccess, hasCalibrationAccess, hasApprovalAccess } from '../generic/Util';

import InstrumentServices from "../../api/instrumentServices";
import CalHistoryTable from './CalHistoryTable';
import "./InstrumentDetailView.css";
import DetailView from '../generic/DetailView';
import GuidedCalServices from '../../api/guidedCalServices.js';
import WizardServices from '../../api/wizardServices.js';
import CalibrationPopup from './CalibrationPopup';
import DownloadCertificatePopup from './DownloadCertPopup';

const guidedCalServices = new GuidedCalServices();
const wizardServices = new WizardServices();

const instrumentServices = new InstrumentServices();

class InstrumentDetailView extends Component {
    constructor(props) {
        super(props);
        const arr = props.location.pathname.split('/');

        this.state = {
            isLoading: false,
            redirect: null,
            instrument_info: {
                pk: arr[arr.length - 1],
                model_number: '',
                model_pk: '',
                model_description: '',
                vendor: '',
                requires_approval: false,
                serial_number: '',
                asset_tag: '',
                comment: '',
                asset_number: '',
                calibration_frequency: '',
                calibration_expiration: '',
                calibration_modes: [],
                calibrator_categories: [],
                calibration_history: [],
                model_categories: [],
                instrument_categories: []
            },
            calibration_pagination: {
                resultCount: 0,
                numPages: 1,
                resultsPerPage: 25,
                currentPageNum: 1,
                isShowAll: false,
                desiredPage: 1
            },
            addCalPopup: {
                isShown: false,
                errors: [],
                isSubmitEnabled: true,
            },
            editInstrumentPopup: {
                isShown: false,
                errors: []
            },
            downloadCertPopup: {
                isShown: false,
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
            isDeleteShown: false,
            currentUser: this.props.user,
        }
        this.onAddCalibrationClicked = this.onAddCalibrationClicked.bind(this);
        this.onAddCalibrationSubmit = this.onAddCalibrationSubmit.bind(this);
        this.onAddCalibrationClose = this.onAddCalibrationClose.bind(this);
        this.onEditInstrumentClicked = this.onEditInstrumentClicked.bind(this);
        this.onEditInstrumentSubmit = this.onEditInstrumentSubmit.bind(this);
        this.onEditInstrumentClosed = this.onEditInstrumentClosed.bind(this);
        this.onDeleteClicked = this.onDeleteClicked.bind(this);
        this.onDeleteSubmit = this.onDeleteSubmit.bind(this);
        this.onDeleteClose = this.onDeleteClose.bind(this);
        this.onWizardClicked = this.onWizardClicked.bind(this);
        this.onWizardClose = this.onWizardClose.bind(this);
        this.makeWizardPopup = this.makeWizardPopup.bind(this);
        this.onGuidedCalClicked = this.onGuidedCalClicked.bind(this);
        this.onGuidedCalClose = this.onGuidedCalClose.bind(this);
        this.makeGuidedCalPopup = this.makeGuidedCalPopup.bind(this);
        this.onFormCalClicked = this.onFormCalClicked.bind(this);
        this.onFormCalClose = this.onFormCalClose.bind(this);
        this.makeFormCalPopup = this.makeFormCalPopup.bind(this);

        this.onDisplayFormCalClicked = this.onDisplayFormCalClicked.bind(this);
        this.onDisplayFormCalClose = this.onDisplayFormCalClose.bind(this);
        this.makeDisplayFormCalPopup = this.makeDisplayFormCalPopup.bind(this);

        this.onCalibrationPopupClose = this.onCalibrationPopupClose.bind(this);
        this.onCalibrationPopupApprovalSubmit = this.onCalibrationPopupApprovalSubmit.bind(this);
        this.onShowCalibrationPopup = this.onShowCalibrationPopup.bind(this);

        this.onDownloadCertificateSubmit = this.onDownloadCertificateSubmit.bind(this);
        this.onDownloadCertificateClick = this.onDownloadCertificateClick.bind(this);
        this.onDownloadCertificateClose = this.onDownloadCertificateClose.bind(this);

        this.onToggleShowAll = this.onToggleShowAll.bind(this);
        this.onCalHistoryTableChange = this.onCalHistoryTableChange.bind(this);
        this.onSupplementDownloadClicked = this.onSupplementDownloadClicked.bind(this);
        this.onLoadBankClick = this.onLoadBankClick.bind(this);
        this.onKlufeClick = this.onKlufeClick.bind(this);
        this.cancelKlufeEvent = this.cancelKlufeEvent.bind(this);
        this.cancelLoadbankEvent = this.cancelLoadbankEvent.bind(this);
    }

    async componentDidMount() {
        if (window.sessionStorage.getItem("klufe") === this.state.instrument_info.pk) {
            await this.cancelKlufeEvent();
        }

        if (window.sessionStorage.getItem("loadbank") === this.state.instrument_info.pk) {
            await this.cancelLoadbankEvent();
        }
        await this.getInstrumentInfo();
        await this.getCalHistory();
    }

    render() {
        const isInstrumentAdmin = hasInstrumentEditAccess(this.props.permissions);
        const headerButtons = (<div className="detail-header-buttons-div">
            <Button onClick={this.onEditInstrumentClicked} hidden={!isInstrumentAdmin}>Edit</Button>
            <Button onClick={this.onDeleteClicked} hidden={!isInstrumentAdmin} variant="danger">Delete</Button>
        </div>)


        let addCalibrationPopup = (this.state.addCalPopup.isShown) ? this.makeAddCalibrationPopup() : null;
        let editInstrumentPopup = (this.state.editInstrumentPopup.isShown) ? this.makeEditInstrumentPopup() : null;
        let deleteInstrumentPopup = (this.state.isDeleteShown) ? this.makeDeletePopup() : null;
        let wizardPopup = (this.state.wizardPopup.isShown) ? this.makeWizardPopup() : null;
        let guidedCalPopup = (this.state.guidedCalPopup.isShown) ? this.makeGuidedCalPopup() : null;
        let formCalPopup = (this.state.formCalPopup.isShown) ? this.makeFormCalPopup() : null;
        let displayFormCalPopup = (this.state.displayFormCalPopup.isShown) ? this.makeDisplayFormCalPopup() : null;
        let calibrationPopup = (this.state.calibrationPopup.isShown) ? this.makeCalibrationPopup() : null;
        let downloadCertificatePopup = (this.state.downloadCertPopup.isShown ? this.makeDownloadCertPopup() : null);

        if (this.state.redirect != null) {
            return <Redirect push to={this.state.redirect} />
        }

        let comment = (this.state.instrument_info.comment === '' ? 'No Comment Entered' : this.state.instrument_info.comment);
        return (
            <div>
                {downloadCertificatePopup}
                {addCalibrationPopup}
                {editInstrumentPopup}
                {deleteInstrumentPopup}
                {wizardPopup}
                {guidedCalPopup}
                {formCalPopup}
                {displayFormCalPopup}
                {calibrationPopup}
                <DetailView
                    title={`${this.state.instrument_info.vendor} ${this.state.instrument_info.model_number} (${this.state.instrument_info.asset_tag})`}
                    headerButtons={headerButtons}
                    col5={this.makeDetailsTable()}
                    comments={comment}
                    bottomElement={this.makeCalHistoryTable()}
                    isLoading={this.state.isLoading}
                />
            </div>

        );
    }

    makeCalHistoryTable = () => {
        const isCalibrationAdmin = hasCalibrationAccess(this.props.permissions);
        let isCalibratable = this.state.instrument_info.calibration_frequency !== 0;
        const isLoadBank = this.state.instrument_info.calibration_modes.includes("load_bank");
        const isKlufe = this.state.instrument_info.calibration_modes.includes("klufe_k5700");
        const isForm = this.state.instrument_info.calibration_modes.includes("custom_form");
        let calButtonRow = (
            <div className="table-button-row">
                <Button onClick={this.onDownloadCertificateClick} disabled={this.state.instrument_info.calibration_history.length === 0}>Download Certificate</Button>
                <Button hidden={!isCalibratable || !isCalibrationAdmin} onClick={this.onAddCalibrationClicked}>Add Calibration</Button>
                <Button onClick={this.onWizardClicked} hidden={!isLoadBank || !isCalibrationAdmin}>Add Load Bank Calibration</Button>
                <Button onClick={this.onGuidedCalClicked} hidden={!isKlufe || !isCalibrationAdmin}>Add Guided Calibration</Button>
                <Button onClick={this.onFormCalClicked} hidden={!isForm || !isCalibrationAdmin}>Add Form Calibration</Button>
            </div>
        )
        return (
            <div hidden={!isCalibratable}>
                <h3>Calibration History</h3>
                <span>(Click on a row for more information)</span>
                <CalHistoryTable
                    data={this.state.instrument_info.calibration_history}
                    onTableChange={this.onCalHistoryTableChange}
                    pagination={
                        {
                            page: this.state.calibration_pagination.currentPageNum,
                            sizePerPage: (this.state.calibration_pagination.isShowAll ? this.state.calibration_pagination.resultCount : this.state.calibration_pagination.resultsPerPage),
                            totalSize: this.state.calibration_pagination.resultCount
                        }}
                    inlineElements={calButtonRow}
                    onSupplementDownload={this.onSupplementDownloadClicked}
                    onLoadBankClick={this.onLoadBankClick}
                    onKlufeClick={this.onKlufeClick}
                    onFormClick={this.onDisplayFormCalClicked}
                    requiresApproval={this.state.instrument_info.requires_approval}
                    onRowClick={this.onShowCalibrationPopup}
                    hasApprovalPermissions={true}
                />
            </div>
        )
    }

    async getInstrumentInfo() {
        await instrumentServices.getInstrument(this.state.instrument_info.pk).then(
            (result) => {
                if (result.success) {
                    let data = result.data;
                    this.setState({
                        ...this.state,
                        instrument_info: {
                            ...this.state.instrument_info,
                            model_number: data.item_model.model_number,
                            model_pk: data.item_model.pk,
                            vendor: data.item_model.vendor,
                            requires_approval: data.item_model.requires_approval,
                            model_description: data.item_model.description,
                            calibration_modes: data.item_model.calibration_modes,
                            serial_number: data.serial_number,
                            comment: data.comment,
                            calibration_frequency: data.item_model.calibration_frequency,
                            calibration_expiration: data.calibration_expiration,
                            model_categories: data.categories.item_model_categories,
                            instrument_categories: data.categories.instrument_categories,
                            asset_tag: data.asset_tag,
                            calibrator_categories: data.categories.calibrator_categories,
                        }
                    })
                }

            }
        )
    }

    async getCalHistory() {
        const calPagination = this.state.calibration_pagination;
        await instrumentServices.getCalFromInstrument(this.state.instrument_info.pk, calPagination.desiredPage, calPagination.isShowAll, calPagination.resultsPerPage).then(
            (result) => {
                if (result.success) {
                    this.setState({
                        instrument_info: {
                            ...this.state.instrument_info,
                            calibration_history: result.data.data,
                            calibration_pagination: {
                                ...this.state.calibration_pagination,
                                resultCount: result.data.count
                            }
                        }
                    })
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
                } else {
                    console.log("failed to get cal history");
                }
            }
        )
    }


    makeDetailsTable() {
        let detailData = this.state.instrument_info;
        let isCalibratable = this.state.instrument_info.calibration_frequency !== 0;

        return (
            <Table size="sm" bordered>
                {/* <tr className="text-center">
                    <th colSpan={2}>Instrument Information</th>
                </tr> */}
                <tbody>
                    <tr>
                        <td><strong>Model</strong></td>
                        <td>
                            <Link to={`/models-detail/${this.state.instrument_info.model_pk}`} className="green-link">{detailData.vendor}-{detailData.model_number}</Link>
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Model Description</strong></td>
                        <td>
                            {detailData.model_description}
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Model Categories</strong></td>

                        <td>
                            <div className="detail-view-categories">
                                {this.state.instrument_info.model_categories.map(el => el.name).join(', ')}
                            </div>
                        </td>
                    </tr>
                    <tr hidden={!isCalibratable}>
                        <td><strong>Calibrator Categories</strong></td>

                        <td>
                            <div className="detail-view-categories">
                                {this.state.instrument_info.calibrator_categories.map(el => el.name).join(', ')}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Asset Tag</strong></td>
                        <td>{this.state.instrument_info.asset_tag}</td>
                    </tr>
                    <tr>
                        <td><strong>Serial Number</strong></td>
                        <td>{detailData.serial_number}</td>
                    </tr>

                    <tr>
                        <td className="table-view-bold-td"><strong>Instrument Categories</strong></td>
                        <td>
                            <div className="detail-view-categories">
                                {this.state.instrument_info.instrument_categories.map(el => el.name).join(', ')}
                            </div>
                        </td>
                    </tr>
                    <tr hidden={!isCalibratable}>
                        <td><strong>Next Calibration</strong></td>
                        <td>{this.state.instrument_info.calibration_expiration}</td>
                    </tr>
                    <tr hidden={!isCalibratable}>
                        <td><strong>Calibration Frequency</strong></td>
                        <td>{`${this.state.instrument_info.calibration_frequency} Days`}</td>
                    </tr>
                    <tr hidden={isCalibratable}>
                        <td><strong>Calibration</strong></td>
                        <td>This model isn't calibratable</td>
                    </tr>
                    {/* <tr>
                        <td><strong>Comment</strong></td>
                        <td>{detailData.comment}</td>
                    </tr> */}

                </tbody>
            </Table>
        )
    }

    makeDownloadCertPopup() {
        return(
            <DownloadCertificatePopup
                isShown={this.state.downloadCertPopup.isShown}
                onClose={this.onDownloadCertificateClose}
                onSubmit={this.onDownloadCertificateSubmit}
            />
        )
    }

    makeWizardPopup() {
        return (
            <Wizard
                isShown={this.state.wizardPopup.isShown}
                onClose={this.onWizardClose}
                model_number={this.state.instrument_info.model_number}
                vendor={this.state.instrument_info.vendor}
                serial_number={this.state.instrument_info.serial_number}
                instrument_pk={this.state.instrument_info.pk}
                asset_tag={this.state.instrument_info.asset_tag}
                lb_pk={this.state.wizardPopup.lbPK}
                user={this.props.user}
            />
        )
    }

    makeGuidedCalPopup() {
        return (
            <GuidedCal
                isShown={this.state.guidedCalPopup.isShown}
                onClose={this.onGuidedCalClose}
                klufePK={this.state.guidedCalPopup.pk}
                user={this.props.user}
                model_number={this.state.instrument_info.model_number}
                vendor={this.state.instrument_info.vendor}
                serial_number={this.state.instrument_info.serial_number}
                instrument_pk={this.state.instrument_info.pk}
                asset_tag={this.state.instrument_info.asset_tag}

            />
        )
    }

    makeFormCalPopup() {
        return (
            <FormCal
                isShown={this.state.formCalPopup.isShown}
                onClose={this.onFormCalClose}
                user={this.props.user}
                instrument_pk={this.state.instrument_info.pk}
                model_pk={this.state.instrument_info.model_pk}
                calibratorCategories={this.state.instrument_info.calibrator_categories.map(x => x.name)}
            />
        )
    }

    makeDisplayFormCalPopup(){
        return (
            <DisplayFormCal
                isShown={this.state.displayFormCalPopup.isShown}
                onClose={this.onDisplayFormCalClose}
                cal_pk={this.state.displayFormCalPopup.pk}/>
                )
    }
    
    makeCalibrationPopup() {
        return(
            <CalibrationPopup
                calibrationEvent={this.state.calibrationPopup.calEvent}
                currentUser={this.props.user}
                isApprovalForm={this.state.calibrationPopup.isApprovalForm}
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

    makeAddCalibrationPopup() {
        return (
            <AddCalibrationPopup
                isShown={this.state.addCalPopup.isShown}
                onClose={this.onAddCalibrationClose}
                onSubmit={this.onAddCalibrationSubmit}
                errors={this.state.addCalPopup.errors}
                isSubmitEnabled={this.state.addCalPopup.isSubmitEnabled}
                calibratorCategories={this.state.instrument_info.calibrator_categories.map(x => x.name)}
                instrumentPk={this.state.instrument_info.pk}
            />
        )
    }


    makeEditInstrumentPopup() {
        let currentInstrument = {
            model_pk: this.state.instrument_info.model_pk,
            model_number: this.state.instrument_info.model_number,
            vendor: this.state.instrument_info.vendor,
            serial_number: this.state.instrument_info.serial_number,
            comment: this.state.instrument_info.comment,
            instrument_categories: this.state.instrument_info.instrument_categories,
            asset_tag: this.state.instrument_info.asset_tag
        }
        return (
            <EditInstrumentPopop
                isShown={this.state.editInstrumentPopup.isShown}
                onSubmit={this.onEditInstrumentSubmit}
                onClose={this.onEditInstrumentClosed}
                currentInstrument={currentInstrument}
                errors={this.state.editInstrumentPopup.errors}
            />
        )
    }

    makeDeletePopup() {
        let body = (
            <p>Are you sure you want to delete instrument #{this.state.instrument_info.asset_tag}?</p>
        )
        return (
            <DeletePopup
                show={this.state.isDeleteShown}
                body={body}
                headerText="Warning!"
                closeButtonText="Cancel"
                submitButtonText="Delete"
                onClose={this.onDeleteClose}
                onSubmit={this.onDeleteSubmit}
                submitButtonVariant="danger"
                isPrimaryOnLeft={true}
            />
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
                        this.getCalHistory();
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
                        this.getCalHistory();
                    })
                }
                return;
            default:
                return;
        }
    }

    onShowCalibrationPopup(calEvent) {
        const isApprover = hasApprovalAccess(this.props.user.permissions_groups);
        console.log(this.isOtherModalShowing());
        if(!this.isOtherModalShowing()) {
            this.setState({
                calibrationPopup: {
                    ...this.state.calibrationPopup,
                    isShown: true,
                    calEvent: calEvent,
                    isApprovalForm: (isApprover && calEvent.approval_status === 'Pending')
                },
            })
        }
    }

    isOtherModalShowing() {
        const isLoadBankShowing = this.state.wizardPopup.isShown;
        const isGuidedCalShowing = this.state.guidedCalPopup.isShown;
        const isFormCalShown = this.state.formCalPopup.isShown;
        const isDisplayFormCalShown = this.state.displayFormCalPopup.isShown;
        return isLoadBankShowing || isGuidedCalShowing || isFormCalShown || isDisplayFormCalShown;
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
            if(result.success) {
                this.getCalHistory();
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

    onAddCalibrationClicked() {
        this.setState({
            addCalPopup: {
                ...this.state.addCalPopup,
                isShown: true
            }
        })
    }

    async onAddCalibrationSubmit(calibrationEvent) {
        console.log(calibrationEvent.calibratorInstruments);
        if (this.isFileSizeGood(calibrationEvent.file)) {
            this.setState({
                isLoading: true,
                isSubmitEnabled: false,
            }, async () => {
                await instrumentServices.addCalibrationEvent(this.state.instrument_info.pk, calibrationEvent.date, calibrationEvent.comment, calibrationEvent.file, calibrationEvent.calibratorInstruments)
                    .then((result) => {
                        if (result.success) {
                            this.getInstrumentInfo();
                            this.getCalHistory();
                            this.onAddCalibrationClose();
                        } else {
                            let formattedErrors = rawErrorsToDisplayed(result.errors, ErrorFile["add_calibration"]);
                            this.setState({
                                addCalPopup: {
                                    ...this.state.addCalPopup,
                                    errors: formattedErrors
                                }
                            })
                        }
                        this.setState({
                            isLoading: false,
                            addCalPopup: {
                                ...this.state.addCalPopup,
                                isSubmitEnabled: true,
                            }
                        });
                    });
            });
        } else {
            let error = {
                "non_field_errors": [
                    "File size too large."
                ]
            }
            let formattedErrors = rawErrorsToDisplayed(error, ErrorFile["add_calibration"]);
            this.setState({
                isLoading: false,
                addCalPopup: {
                    ...this.state.addCalPopup,
                    errors: formattedErrors,
                }
            })
        }


    }

    isFileSizeGood(file) {
        if (file !== '') {
            let fileSizeMb = file.size / 1024 / 1024;
            if (fileSizeMb > 32) {
                return false;
            }
        }
        return true
    }

    onAddCalibrationClose() {
        this.setState({
            addCalPopup: {
                ...this.state.addCalPopup,
                isShown: false,
                errors: []
            }
        })
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

    onModelLinkClicked() {
        this.setState({
            redirect: `/models-detail/${this.state.instrument_info.model_pk}`
        })
    }

    onEditInstrumentClicked() {
        this.setState({
            editInstrumentPopup: {
                ...this.state.editInstrumentPopup,
                isShown: true
            }
        })
    }

    async onEditInstrumentSubmit(newInstrument) {
        await instrumentServices.editInstrument(this.state.instrument_info.pk, newInstrument.model_pk, newInstrument.serial_number, newInstrument.comment, newInstrument.instrument_categories, newInstrument.asset_tag)
            .then((result) => {
                if (result.success) {
                    this.getInstrumentInfo();
                    this.onEditInstrumentClosed();
                } else {
                    let formattedErrors = rawErrorsToDisplayed(result.errors, ErrorFile["add_edit_instrument"]);
                    this.setState({
                        editInstrumentPopup: {
                            ...this.state.editInstrumentPopup,
                            errors: formattedErrors
                        }
                    })
                }
            });
    }

    onEditInstrumentClosed() {
        this.setState({
            editInstrumentPopup: {
                ...this.state.editInstrumentPopup,
                isShown: false,
                errors: []
            }
        })
    }

    onDeleteClicked() {
        this.setState({
            isDeleteShown: true
        })
    }

    onDeleteClose() {
        this.setState({
            isDeleteShown: false
        })
    }

    onFormCalClicked() {
        this.setState({
            formCalPopup: {
                ...this.state.formCalPopup,
                isShown: true,
                pk: null,
            },
            calibrationPopup: {
                ...this.state.calibrationPopup,
                isShown: false,
            }
        })
    }

    onFormCalClose() {
        this.setState({
            formCalPopup: {
                ...this.state.formCalPopup,
                isShown: false,
                pk: null,
            }
        })
        this.getCalHistory();
    }


    onDisplayFormCalClicked(e) {
        this.setState({
            displayFormCalPopup: {
                ...this.state.displayFormCalPopup,
                pk: e.target.value,
                isShown: true,
            },
            calibrationPopup: {
                ...this.state.calibrationPopup,
                isShown: false,
            }
        })
    }

    onDisplayFormCalClose() {
        this.setState({
            displayFormCalPopup: {
                ...this.state.displayFormCalPopup,
                pk: null,
                isShown: false,
            },
        })
    }

    async onDeleteSubmit() {
        await instrumentServices.deleteInstrument(this.state.instrument_info.pk).then(result => {
            this.onDeleteClose();
            this.setState({
                redirect: '/instruments/'
            })
        });
    }

    onWizardClicked() {
        this.setState({
            wizardPopup: {
                ...this.state.wizardPopup,
                isShown: true,
                lbPK: null,
            },
            calibrationPopup: {
                ...this.state.calibrationPopup,
                isShown: false,
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
        this.getCalHistory();
    }

    onGuidedCalClicked() {
        this.setState({
            guidedCalPopup: {
                ...this.state.guidedCalPopup,
                isShown: true,
                pk: null,
            },
            calibrationPopup: {
                ...this.state.calibrationPopup,
                isShown: false,
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
        this.getCalHistory();
    }

    onDownloadCertificateClick() {
        this.setState({
            downloadCertPopup: {
                ...this.state.downloadCertPopup,
                isShown: true,
            }
        })
    }
    onDownloadCertificateClose() {
        this.setState({
            downloadCertPopup: {
                ...this.state.downloadCertPopup,
                isShown: false,
            }
        })
    }

    async onDownloadCertificateSubmit(hasChainOfTruth) {
        await instrumentServices.getCalibrationPDF(this.state.instrument_info.pk, hasChainOfTruth)
            .then((result) => {
                if (result.success) {
                    let date = dateToString(new Date());
                    nameAndDownloadFile(result.url, `${date}-${this.state.instrument_info.asset_tag}-calibration-certificate`, result.type);
                }
            });
        this.onDownloadCertificateClose();
    }

    async onPaginationClick(num) {
        this.setState({
            calibration_pagination: {
                ...this.state.calibration_pagination,
                desiredPage: num
            }
        }, () => {
            this.getCalHistory();
        })
    }

    async onToggleShowAll() {
        this.setState((prevState) => {
            return {
                calibration_pagination: {
                    ...this.state.calibration_pagination,
                    isShowAll: !prevState.calibration_pagination.isShowAll
                }
            }
        }, () => {
            this.getCalHistory();
        })
    }

    async cancelKlufeEvent() {
        let klufePK = window.sessionStorage.getItem("klufepk");
        await guidedCalServices.deleteKlufeCal(klufePK).then(result => {
            if (result.success) {
                console.log("deleted klufe event")
                window.sessionStorage.removeItem("klufe");
                window.sessionStorage.removeItem("klufepk");
            }
        })
    }

    async cancelLoadbankEvent() {
        let loadbankPK = window.sessionStorage.getItem("loadbankpk");
        await wizardServices.cancelLoadbankCalEvent(loadbankPK).then(result => {
            if (result.success) {
                console.log("deleted loadbank event")
                window.sessionStorage.removeItem("loadbank");
                window.sessionStorage.removeItem("loadbankpk");
            }
        })
    }

}


export default withRouter(InstrumentDetailView);