import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useHistory, withRouter } from "react-router-dom";
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';

import ModelServices from "../../api/modelServices";
import InstrumentServices from '../../api/instrumentServices';

const modelServices = new ModelServices();
const instrumentServices = new InstrumentServices();
let instrumentData = [];
let history;


class ModelDetailView extends Component {
    constructor(props) {
        super(props);
        console.log(props)
        this.state = {
            model_info: {
                pk: this.props.match.params.pk,
                vendor: '',
                model_number: '',
                description: '',
                comment: '',
                calibration_frequency: ''
            }
        }

        this.onMoreClicked = this.onMoreClicked.bind(this)
    }

    async componentDidMount() {
        this.updateInfo();
    }

    render() {
        //instrumentData = instrumentServices.getInstrumentSerialByModel(this.state.model_info.pk);
        //istory = useHistory();
        console.log(this.state.model_info)
        return (
            <div className="background">
                <div className="row mainContent">
                    <div className="col-2 text-center">
                        <img src={logo} alt="Logo" />
                    </div>
                    <div className="col-10">
                        <h2>{`Model: ${this.state.model_info.model_number}`}</h2>
                        <Row>
                            <Col>{this.makeDetailsTable()}</Col>
                            <Col xs={6}>
                                {this.makeInstrumentsTable()}
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>

        );
    }


    makeDetailsTable() {
        let modelInfo = this.state.model_info;
        return (
            <Table bordered hover>
                <tbody>
                    <tr>
                        <td><strong>Vendor</strong></td>
                        <td>{modelInfo.vendor}</td>
                    </tr>
                    <tr>
                        <td><strong>Model</strong></td>
                        <td>{modelInfo.model_number}</td>
                    </tr>
                    <tr>
                        <td><strong>Description</strong></td>
                        <td>{modelInfo.description}</td>
                    </tr>
                    <tr>
                        <td><strong>Comment</strong></td>
                        <td>{modelInfo.comment}</td>
                    </tr>
                    <tr>
                        <td><strong>Calibration Frequency</strong></td>
                        <td>{modelInfo.calibration_frequency}</td>
                    </tr>
                </tbody>
            </Table>
        )
    }

    makeInstrumentsTable() {
        let rows = [];
        let count = 1;
        instrumentData.forEach((element) => {
            let currentRow = [];
            currentRow.push(
                <td>{count}</td>
            )
            currentRow.push(
                <td>{element["serial"]}</td>
            )
            currentRow.push(
                <td><Button onClick={this.onMoreClicked} value={element["pk"]}>More</Button></td>
            )
            count++;
            rows.push(
                <tr>{currentRow}</tr>
            )
        });

        return (
            <Table bordered hover>
                <thead>
                    <tr>
                        <th colSpan="3" className="text-center">Instances by Serial Number</th>
                    </tr>
                    <tr>
                        <th>#</th>
                        <th>Serial Number</th>
                        <th>More</th>
                    </tr>

                </thead>
                <tbody>
                    {rows}
                </tbody>
            </Table>
        )

    }

    onMoreClicked(e) {
        //history.push(`/instruments/${e.target.value}`);
    }

    async updateInfo() {
        await modelServices.getModel(this.state.model_info.pk).then((result) => {
            if (result.success) {
                this.setState({
                    model_info: result.data
                })
            } else {
                console.log("error")
            }
        })
    }
}
export default withRouter(ModelDetailView);