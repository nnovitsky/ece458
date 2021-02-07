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
        this.state = {
            redirect: null,
            instrument_info: {
                instrument_pk: this.props.match.params.pk,
                model_number: 'fluke',
                model_pk: '1',
                serial: '785-B45',
                comment: 'this is a multimeter',
                calibration_history: []
            },
            isAddCalPopupShown: false,
        }

        this.onAddCalibrationClicked = this.onAddCalibrationClicked.bind(this);
        this.onAddCalibrationSubmit = this.onAddCalibrationSubmit.bind(this);
        this.onAddCalibrationClose = this.onAddCalibrationClose.bind(this);
    }

    async componentDidMount() {

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