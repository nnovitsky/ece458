import React from 'react';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import logo from '../../assets/HPT_logo_crop.png';
import { useParams } from "react-router-dom";

import InstrumentServices from "../../api/instrumentServices";

const instrumentServices = new InstrumentServices();
let detailData;
//let history;


const InstrumentDetailView = () => {
    let { pk } = useParams();
    detailData = instrumentServices.getInstrument(pk);
    //history = useHistory();
    return (
        <div className="background">
            <div className="row mainContent">
                <div className="col-2 text-center">
                        <img src={logo} alt="Logo" />
                    </div>
                <div className="col-10">
                        <h1>{`Instrument: ${detailData["serial"]}`}</h1>
                <Row>
                    <Col>{makeDetailsTable()}</Col>
                    <Col xs={6}>
                        {makeCallibrationTable()}
                    </Col>
                </Row>
                    </div>
                </div>
        </div>

    );
}

const makeDetailsTable = () => {
    return (
        <Table bordered hover>
            <tbody>
                <tr>
                    <td><strong>Vendor</strong></td>
                    <td>{detailData["vendor"]}</td>
                </tr>
                <tr>
                    <td><strong>Model</strong></td>
                    <td>{detailData["model number"]}</td>
                </tr>
                <tr>
                    <td><strong>Description</strong></td>
                    <td>{detailData["short description"]}</td>
                </tr>
                <tr>
                    <td><strong>Last Callibration</strong></td>
                    <td>{detailData["most recent callibration date"]}</td>
                </tr>
                <tr>
                    <td><strong>Next Callibration</strong></td>
                    <td>TBD</td>
                </tr>
            </tbody>
        </Table>
    )
}

const makeCallibrationTable = () => {
    return (
        <h3>Callibration History will go here</h3>
    )
}

export default InstrumentDetailView;