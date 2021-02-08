import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import logo from '../../assets/HPT_logo_crop.png';
import { withRouter } from "react-router-dom";

import AddCalibrationPopup from './AddCalibrationPopup';
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
                serial: '',
                comment: '',
                calibration_history: [],
            },
            isAddCalPopupShown: false,
        }

        console.log(this.state.instrument_info.pk)

        this.onAddCalibrationClicked = this.onAddCalibrationClicked.bind(this);
        this.onAddCalibrationSubmit = this.onAddCalibrationSubmit.bind(this);
        this.onAddCalibrationClose = this.onAddCalibrationClose.bind(this);
    }

    async componentDidMount() {
        await this.getInstrumentInfo();
    }

    render() {
        let addCalibrationPopup = this.makeAddCalibrationPopup();
        return (
            <div>
                {addCalibrationPopup}
                <div className="background">
                    <div className="row mainContent">
                        <div className="col-2 text-center button-col">
                            <img src={logo} alt="Logo" />
                            <Button onClick={this.onAddCalibrationClicked}>Add Calibration</Button>
                            <Button>Download Certificate</Button>
                        </div>
                        <div className="col-10">
                            <h1>{`Instrument: ${this.state.instrument_info.se}`}</h1>
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
                let data = result.data
                console.log(data)
                this.setState({
                    instrument_info: {
                        ...this.state.instrument_info,
                        model_number: data.item_model.model_number,
                        model_pk: data.item_model.pk,
                        serial: data.serial_number,
                        comment: data.comment,
                        calibration_history: data.calibration_event,

                    }
                })
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
                        <td>{detailData.serial}</td>
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

    onAddCalibrationClicked() {
        this.setState({
            isAddCalPopupShown: true,
        })
    }

    async onAddCalibrationSubmit(calibrationEvent) {
        console.log(calibrationEvent);
        this.onAddCalibrationClose();
    }

    onAddCalibrationClose() {
        this.setState({
            isAddCalPopupShown: false
        })
    }

    makeCalibrationTable() {
        return (
            <GenericTable
                data={this.state.instrument_info.calibration_history}
                keys={['user', 'date', 'comment']}
                headers={["User", "Date", "Comment"]}
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
}

export default withRouter(InstrumentDetailView);