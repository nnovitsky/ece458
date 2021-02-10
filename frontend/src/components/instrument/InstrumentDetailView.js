import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import logo from '../../assets/HPT_logo_crop.png';
import './instrument.css';
import { Redirect, withRouter } from "react-router-dom";
import PropTypes from 'prop-types';

import AddCalibrationPopup from './AddCalibrationPopup';
import EditInstrumentPopop from './AddInstrumentPopup';
import DeletePopup from '../generic/GenericPopup';
import GenericTable from '../generic/GenericTable';
import ErrorFile from "../../api/ErrorMapping/InstrumentErrors.json";
import { rawErrorsToDisplayed } from '../generic/Util';

import InstrumentServices from "../../api/instrumentServices";

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
                vendor: '',
                serial_number: '',
                comment: '',
                calibration_frequency: '',
                calibration_history: [],
            },
            addCalPopup: {
                isShown: false,
                errors: [],
            },
            isEditInstrumentShown: false,
            isDeleteShown: false,
            currentUser: ''
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
    }

    async componentDidMount() {
        await this.getInstrumentInfo();
    }

    render(

        adminButtons = <div>
            <Button onClick={this.onEditInstrumentClicked}>Edit Instrument</Button>
            <Button onClick={this.onDeleteClicked}>Delete Instrument</Button>
        </div>
    ) {
        let addCalibrationPopup = this.makeAddCalibrationPopup();
        let editInstrumentPopup = this.makeEditInstrumentPopup();
        let deleteInstrumentPopup = this.makeDeletePopup();

        let calibrationCol = (
            <Col xs={7}>
                {this.makeCalibrationTable()}
            </Col>
        )

        let displayedCalibrationData = (this.state.instrument_info.calibration_frequency !== 0) ? calibrationCol : null;
        if (this.state.redirect != null) {
            return <Redirect to={this.state.redirect} />
        }
        return (
            <div>
                {addCalibrationPopup}
                {editInstrumentPopup}
                {deleteInstrumentPopup}
                <div className="background">
                    <div className="row mainContent">
                        <div className="col-2 text-center button-col">
                            <img src={logo} alt="Logo" />
                            {this.props.is_admin ? adminButtons : null}
                            <Button hidden={this.state.instrument_info.calibration_frequency === 0} onClick={this.onAddCalibrationClicked}>Add Calibration</Button>
                            <Button>Download Certificate</Button>
                        </div>
                        <div className="col-10">
                            <h1>{`Instrument: ${this.state.instrument_info.serial_number}`}</h1>
                            <Row>
                                <Col>{this.makeDetailsTable()}</Col>
                                {displayedCalibrationData}
                            </Row>
                        </div>
                    </div>
                </div>
            </div>


        );
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
                            serial_number: data.serial_number,
                            comment: data.comment,
                            calibration_frequency: data.item_model.calibration_frequency,
                            calibration_history: data.calibration_events,

                        }
                    })
                }

            }
        )
    }


    makeDetailsTable() {
        let detailData = this.state.instrument_info;

        let calibrationData = (
            <>
                <tr>
                    <td><strong>Next Calibration</strong></td>
                    <td>{'FIGURE THIS OUT'}</td>
                </tr>
                <tr>
                    <td><strong>Calibration Frequency</strong></td>
                    <td>{`${this.state.instrument_info.calibration_frequency} Days`}</td>
                </tr>
            </>
        )

        let noCalibrationData = (
            <tr>
                <td><strong>Calibration</strong></td>
                <td>This model isn't calibratable</td>
            </tr>
        )

        let calibrationIncluded = (this.state.instrument_info.calibration_frequency !== 0) ? calibrationData : noCalibrationData;

        return (
            <Table bordered>
                <tbody>
                    <tr>
                        <td><strong>Serial Number</strong></td>
                        <td>{detailData.serial_number}</td>
                    </tr>
                    <tr>
                        <td><strong>Model</strong></td>
                        <td><a href={`/models/${this.state.instrument_info.model_pk}`}>{detailData.model_number}</a></td>
                    </tr>
                    <tr>
                        <td><strong>Comment</strong></td>
                        <td>{detailData.comment}</td>
                    </tr>
                    {calibrationIncluded}

                </tbody>
            </Table>
        )
    }

    makeAddCalibrationPopup() {
        return (
            <AddCalibrationPopup
                isShown={this.state.addCalPopup.isShown}
                onClose={this.onAddCalibrationClose}
                onSubmit={this.onAddCalibrationSubmit}
                errors={this.state.addCalPopup.errors}
            />
        )
    }


    makeEditInstrumentPopup() {
        let currentInstrument = {
            model_pk: this.state.instrument_info.model_pk,
            model_number: this.state.instrument_info.model_number,
            vendor: this.state.instrument_info.vendor,
            serial_number: this.state.instrument_info.serial_number,
            comment: this.state.instrument_info.comment
        }
        return (
            <EditInstrumentPopop
                isShown={this.state.isEditInstrumentShown}
                onSubmit={this.onEditInstrumentSubmit}
                onClose={this.onEditInstrumentClosed}
                currentInstrument={currentInstrument}
            />
        )
    }

    makeDeletePopup() {
        let body = (
            <p>Are you sure you want to delete Instrument: {this.state.instrument_info.serial_number}?</p>
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

    onAddCalibrationClicked() {
        this.setState({
            addCalPopup: {
                ...this.state.addCalPopup,
                isShown: true
            }
        })
    }

    async onAddCalibrationSubmit(calibrationEvent) {
        await instrumentServices.addCalibrationEvent(this.state.instrument_info.pk, calibrationEvent.date, calibrationEvent.comment)
            .then((result) => {
                if (result.success) {
                    this.getInstrumentInfo();
                    this.onAddCalibrationClose();
                } else {
                    let formattedErrors = rawErrorsToDisplayed(result.errors, ErrorFile["add_calibration"]);
                    console.log(formattedErrors);
                    this.setState({
                        addCalPopup: {
                            ...this.state.addCalPopup,
                            errors: formattedErrors
                        }
                    })
                }
            });

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

    makeCalibrationTable() {
        console.log(this.state.instrument_info.calibration_history)
        return (

            <GenericTable
                data={this.state.instrument_info.calibration_history}
                keys={['$.date', '$.comment', '$.user.first_name', '$.user.last_name', '$.user.username']}
                headers={["Date", "Comment", "First Name", 'Last Name', "Username"]}
                buttonFunctions={[]}
                buttonText={[]}
                tableTitle="Calibration History"

            />
        )
    }

    onModelLinkClicked() {
        this.setState({
            redirect: `/models/${this.state.instrument_info.model_pk}`
        })
    }

    onEditInstrumentClicked() {
        this.setState({
            isEditInstrumentShown: true,
        })

    }

    async onEditInstrumentSubmit(newInstrument) {
        console.log('Submitted')
        console.log(newInstrument)
        await instrumentServices.editInstrument(this.state.instrument_info.pk, newInstrument.model_pk, newInstrument.serial_number, newInstrument.comment).then(
            (result) => {
                this.getInstrumentInfo();
            }
        )
        this.onEditInstrumentClosed();
    }

    onEditInstrumentClosed() {
        this.setState({
            isEditInstrumentShown: false,
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
        console.log("Deleting instrument");
        await instrumentServices.deleteInstrument(this.state.instrument_info.pk).then(result => {
            this.onDeleteClose();
            this.setState({
                redirect: '/instruments/'
            })
        });
    }
}

export default withRouter(InstrumentDetailView);

InstrumentDetailView.propTypes = {
    is_admin: PropTypes.bool.isRequired
}