import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import logo from '../../assets/HPT_logo_crop.png';
import { withRouter } from "react-router-dom";

import AddCalibrationPopup from './AddCalibrationPopup';
import EditInstrumentPopop from './AddInstrumentPopup';
import GenericTable from '../generic/GenericTable';

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
                calibration_history: [],
            },
            isAddCalPopupShown: false,
            isEditInstrumentShown: false,
            currentUser: ''
        }
        this.onAddCalibrationClicked = this.onAddCalibrationClicked.bind(this);
        this.onAddCalibrationSubmit = this.onAddCalibrationSubmit.bind(this);
        this.onAddCalibrationClose = this.onAddCalibrationClose.bind(this);
        this.onEditInstrumentClicked = this.onEditInstrumentClicked.bind(this);
        this.onEditInstrumentSubmit = this.onEditInstrumentSubmit.bind(this);
        this.onEditInstrumentClosed = this.onEditInstrumentClosed.bind(this);
    }

    async componentDidMount() {
        await this.getInstrumentInfo();
    }

    render() {
        let addCalibrationPopup = this.makeAddCalibrationPopup();
        let editInstrumentPopup = this.makeEditInstrumentPopup();
        return (
            <div>
                {addCalibrationPopup}
                {editInstrumentPopup}
                <div className="background">
                    <div className="row mainContent">
                        <div className="col-2 text-center button-col">
                            <img src={logo} alt="Logo" />
                            <Button onClick={this.onEditInstrumentClicked}>Edit Instrument</Button>
                            <Button onClick={this.onAddCalibrationClicked}>Add Calibration</Button>
                            <Button>Download Certificate</Button>
                        </div>
                        <div className="col-10">
                            <h1>{`Instrument: ${this.state.instrument_info.serial_number}`}</h1>
                            <Row>
                                <Col>{this.makeDetailsTable()}</Col>
                                <Col xs={7}>
                                    {this.makeCalibrationTable()}
                                </Col>
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
                            calibration_history: data.calibration_events,

                        }
                    })
                }

            }
        )
    }


    makeDetailsTable() {
        let detailData = this.state.instrument_info;
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
                    <tr>
                        <td><strong>Last Callibration</strong></td>
                        <td>{'FIGURE THIS OUT'}</td>
                    </tr>

                </tbody>
            </Table>
        )
    }

    makeAddCalibrationPopup() {
        return (
            <AddCalibrationPopup
                isShown={this.state.isAddCalPopupShown}
                onClose={this.onAddCalibrationClose}
                onSubmit={this.onAddCalibrationSubmit}
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

    onAddCalibrationClicked() {
        this.setState({
            isAddCalPopupShown: true,
        })
    }

    async onAddCalibrationSubmit(calibrationEvent) {
        console.log(calibrationEvent);
        await instrumentServices.addCalibrationEvent(this.state.instrument_info.pk, calibrationEvent.date, calibrationEvent.comment);
        await this.getInstrumentInfo();
        this.onAddCalibrationClose();
    }

    onAddCalibrationClose() {
        this.setState({
            isAddCalPopupShown: false
        })
    }

    makeCalibrationTable() {
        console.log(this.state.instrument_info.calibration_history)
        return (
            <GenericTable
                data={this.state.instrument_info.calibration_history}
                keys={['date', 'comment']}
                headers={["Date", "Comment"]}
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
}

export default withRouter(InstrumentDetailView);