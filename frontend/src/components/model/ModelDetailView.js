import React from 'react';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useHistory, useParams } from "react-router-dom";
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';

import ModelServices from "../../api/modelServices";
import InstrumentServices from '../../api/instrumentServices';

const modelServices = new ModelServices();
const instrumentServices = new InstrumentServices();
let detailData;
let instrumentData;
let history;


const ModelDetailView = () => {
    let { pk } = useParams();
    detailData = modelServices.getModel(pk);
    instrumentData = instrumentServices.getInstrumentSerialByModel(pk);
    history = useHistory();
    return (
        <div className="background">
        <div className="row mainContent">
            <div className="col-2 text-center">
                <img src={logo} alt="Logo" />
            </div>
            <div className="col-10">
                <h2>{`Model: ${detailData["model number"]}`}</h2>
                    <Row>
                        <Col>{makeDetailsTable()}</Col>
                    <Col xs={6}>
                        {makeInstrumentsTable()}
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
                    <td><strong>Vendor: </strong>{detailData["vendor"]}</td>
                </tr>
                <tr>
                    <td><strong>Model: </strong>{detailData["model number"]}</td>
                </tr>
                <tr>
                    <td><strong>Description: </strong>{detailData["description"]}</td>
                </tr>
                <tr>
                    <td><strong>Comment: </strong>{detailData["comment"]}</td>
                </tr>
            </tbody>
        </Table>
    )
}

const makeInstrumentsTable = () => {
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
            <td><Button onClick={onMoreClicked} value={element["pk"]}>More</Button></td>
        )
        count++;
        rows.push(
            <tr>{currentRow}</tr>
        )
    });

    return (
        <Table bordered hover>
            <thead>
                <th>#</th>
                <th>Serial Number</th>
                <th>More</th>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </Table>
    )

}

const onMoreClicked = (e) => {
    history.push(`/instruments/${e.target.value}`);
}

export default ModelDetailView;