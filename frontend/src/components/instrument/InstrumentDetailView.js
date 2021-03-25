import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { Link, Redirect, withRouter } from "react-router-dom";
import PropTypes from 'prop-types';

import AddCalibrationPopup from './AddCalibrationPopup';
import EditInstrumentPopop from './AddInstrumentPopup';
import DeletePopup from '../generic/GenericPopup';
import Wizard from '../wizard/Wizard.js';
import GuidedCal from '../guidedCal/GuidedCal.js';
import ErrorFile from "../../api/ErrorMapping/InstrumentErrors.json";
import { rawErrorsToDisplayed, nameAndDownloadFile, dateToString, hasInstrumentEditAccess, hasCalibrationAccess } from '../generic/Util';

import InstrumentServices from "../../api/instrumentServices";
import CalHistoryTable from './CalHistoryTable';
import "./InstrumentDetailView.css";
import DetailView from '../generic/DetailView';

const instrumentServices = new InstrumentServices();

class InstrumentDetailView extends Component {
    constructor(props) {
        super(props);
        const arr = props.location.pathname.split('/')

        this.state = {
            redirect: null,
            instrument_info: {
                pk: arr[arr.length - 1],
                model_number: '',
                model_pk: '',
                model_description: '',
                vendor: '',
                serial_number: '',
                asset_tag: '',
                comment: '',
                asset_number: '',
                calibration_frequency: '',
                calibration_expiration: '',
                calibration_modes: [],
                calibration_history: [],
                model_categories: [],
                instrument_categories: []
            },
            calibration_pagination: {
                resultCount: 0,
                numPages: 1,
                resultsPerPage: 10,
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
            wizardPopup: {
                isShown: false,
                lbPK: null,
            },
            guidedCalPopup: {
                isShown: false,
                pk: null,
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


        this.onCertificateRequested = this.onCertificateRequested.bind(this);
        this.onToggleShowAll = this.onToggleShowAll.bind(this);
        this.onCalHistoryTableChange = this.onCalHistoryTableChange.bind(this);
        this.onSupplementDownloadClicked = this.onSupplementDownloadClicked.bind(this);
        this.onLoadBankClick = this.onLoadBankClick.bind(this);
        this.onKlufeClick = this.onKlufeClick.bind(this);
    }

    async componentDidMount() {
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

        if (this.state.redirect != null) {
            return <Redirect push to={this.state.redirect} />
        }

        let comment = (this.state.instrument_info.comment === '' ? 'No Comment Entered' : this.state.instrument_info.comment);
        return (
            <div>
                {addCalibrationPopup}
                {editInstrumentPopup}
                {deleteInstrumentPopup}
                {wizardPopup}
                {guidedCalPopup}
                <DetailView
                    title={`${this.state.instrument_info.vendor} ${this.state.instrument_info.model_number} (${this.state.instrument_info.asset_tag})`}
                    headerButtons={headerButtons}
                    col5={this.makeDetailsTable()}
                    comments={comment}
                    bottomElement={this.makeCalHistoryTable()}
                />
            </div>

        );
    }

    makeCalHistoryTable = () => {
        const isCalibrationAdmin = hasCalibrationAccess(this.props.permissions);
        let isCalibratable = this.state.instrument_info.calibration_frequency !== 0;
        const isLoadBank = this.state.instrument_info.calibration_modes.includes("load_bank");
        const isKlufe = this.state.instrument_info.calibration_modes.includes("klufe_k5700");
        let calButtonRow = (
            <div className="table-button-row">
                <Button hidden={!isCalibratable || !isCalibrationAdmin} onClick={this.onAddCalibrationClicked}>Add Calibration</Button>
                <Button onClick={this.onWizardClicked} hidden={!isLoadBank || !isCalibrationAdmin}>Add Load Bank Calibration</Button>
                <Button onClick={this.onCertificateRequested} disabled={this.state.instrument_info.calibration_history.length === 0}>Download Certificate</Button>
                <Button onClick={this.onGuidedCalClicked} hidden={!isKlufe || !isCalibrationAdmin}>Add Guided Calibration</Button>
            </div>
        )
        return (
            <div hidden={!isCalibratable}>
                <h3>Calibration History</h3>
                <CalHistoryTable
                    data={this.state.instrument_info.calibration_history}
                    onTableChange={this.onCalHistoryTableChange}
                    pagination={
                        {
                            page: this.state.calibration_pagination.currentPageNum,
                            sizePerPage: (this.state.calibration_pagination.showAll ? this.state.calibration_pagination.resultCount : this.state.calibration_pagination.resultsPerPage),
                            totalSize: this.state.calibration_pagination.resultCount
                        }}
                    inlineElements={calButtonRow}
                    onSupplementDownload={this.onSupplementDownloadClicked}
                    onLoadBankClick={this.onLoadBankClick}
                    onKlufeClick={this.onKlufeClick}
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
                            model_description: data.item_model.description,
                            calibration_modes: data.item_model.calibration_modes,
                            serial_number: data.serial_number,
                            comment: data.comment,
                            calibration_frequency: data.item_model.calibration_frequency,
                            calibration_expiration: data.calibration_expiration,
                            model_categories: data.categories.item_model_categories,
                            instrument_categories: data.categories.instrument_categories,
                            asset_tag: data.asset_tag

                        }
                    })
                }

            }
        )
    }

    async getCalHistory() {
        await instrumentServices.getCalFromInstrument(this.state.instrument_info.pk, this.state.calibration_pagination.desiredPage, this.state.calibration_pagination.isShowAll).then(
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
                                resultsPerPage: 10,
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
        let hasHistory = this.state.instrument_info.calibration_frequency !== 0;

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
                    <tr hidden={!hasHistory}>
                        <td><strong>Next Calibration</strong></td>
                        <td>{this.state.instrument_info.calibration_expiration}</td>
                    </tr>
                    <tr hidden={!hasHistory}>
                        <td><strong>Calibration Frequency</strong></td>
                        <td>{`${this.state.instrument_info.calibration_frequency} Days`}</td>
                    </tr>
                    <tr hidden={hasHistory}>
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
                username={this.props.user.username}
            />
        )
    }

    makeGuidedCalPopup() {
        return (
            <GuidedCal
                isShown={this.state.guidedCalPopup.isShown}
                onClose={this.onGuidedCalClose}
                pk={this.state.guidedCalPopup.pk}
                user={this.props.user}
                model_number={this.state.instrument_info.model_number}
                vendor={this.state.instrument_info.vendor}
                serial_number={this.state.instrument_info.serial_number}
                instrument_pk={this.state.instrument_info.pk}
                asset_tag={this.state.instrument_info.asset_tag}

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
                            showAll: true,
                        }
                    }, () => {
                        this.getCalHistory();
                    })
                } else {
                    this.setState({
                        calibration_pagination: {
                            ...this.state.calibration_pagination,
                            desiredPage: page,
                            showAll: false,
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

    onAddCalibrationClicked() {
        this.setState({
            addCalPopup: {
                ...this.state.addCalPopup,
                isShown: true
            }
        })
    }

    async onAddCalibrationSubmit(calibrationEvent) {
        if (this.isFileSizeGood(calibrationEvent.file)) {
            await instrumentServices.addCalibrationEvent(this.state.instrument_info.pk, calibrationEvent.date, calibrationEvent.comment, calibrationEvent.file)
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
                        addCalPopup: {
                            ...this.state.addCalPopup,
                            isSubmitEnabled: true,
                        }
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
                addCalPopup: {
                    ...this.state.addCalPopup,
                    errors: formattedErrors
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
                    nameAndDownloadFile(result.url, `supplement-file`);
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
        console.log(e.target.value)
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

    async onCertificateRequested(e) {
        instrumentServices.getCalibrationPDF(this.state.instrument_info.pk)
            .then((result) => {
                if (result.success) {
                    let date = dateToString(new Date());
                    nameAndDownloadFile(result.url, `${date}-${this.state.instrument_info.asset_tag}-calibration-certificate`);
                }
            })
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

}

export default withRouter(InstrumentDetailView);

InstrumentDetailView.propTypes = {
    is_admin: PropTypes.bool.isRequired
}