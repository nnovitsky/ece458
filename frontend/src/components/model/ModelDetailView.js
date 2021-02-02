import React from 'react';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useParams } from "react-router-dom";
import '../General.css';
import logo from '../../assets/HPT_logo_crop.png';

import ModelServices from "../../api/modelServices";

const modelServices = new ModelServices();
let detailData;
//let history;


const ModelDetailView = () => {
    let { pk } = useParams();
    detailData = modelServices.getModel(pk);
    //history = useHistory();
    return (
        <div className="column-div">
            <div className="left-column">
                <img src={logo} alt="Logo" />
            </div>
            <div className="main-div">
                <h2>{`Model: ${detailData["model number"]}`}</h2>
                    <Row>
                        <Col>{makeDetailsTable()}</Col>
                        <Col xs={8}>Serial Instances Table to go here</Col>
                    </Row>
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

export default ModelDetailView;