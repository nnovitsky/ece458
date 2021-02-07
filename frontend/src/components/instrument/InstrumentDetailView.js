import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import logo from '../../assets/HPT_logo_crop.png';
import { withRouter } from "react-router-dom";

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
            }
        }

        this.onModelLinkClicked = this.onModelLinkClicked.bind(this);
    }

    async componentDidMount() {

    }

    render() {
        return (
            <div className="background">
                <div className="row mainContent">
                    <div className="col-2 text-center">
                        <img src={logo} alt="Logo" />
                    </div>
                    <div className="col-10">
                        <h1>{`Instrument: ${this.state.instrument_info.se}`}</h1>
                        <Row>
                            <Col>{this.makeDetailsTable()}</Col>
                            <Col xs={6}>
                                {this.makeCallibrationTable()}
                            </Col>
                        </Row>
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

    makeCallibrationTable() {
        return (
            <h3>Callibration History will go here</h3>
        )
    }

    onModelLinkClicked() {
        this.setState({
            redirect: `/models/${this.state.instrument_info.model_pk}`
        })
    }
}

export default withRouter(InstrumentDetailView);