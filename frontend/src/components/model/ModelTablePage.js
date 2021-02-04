import React from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { useHistory } from "react-router-dom";
import ModelServices from "../../api/modelServices";
import ModelFilterBar from "./ModelFilterBar";
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';

let history;
let modelData;
const modelServices = new ModelServices();

const keys = ["model number", "vendor", "description", "callibration frequency"];
const headerText = ["Model Number", "Vendor", "Description", "Callibration (days)", "More"];

const ModelTable = () => {
    modelData = modelServices.getModels();
    history = useHistory();
    console.log(modelServices.getAllModelNumbers())
    return (
        <div className="column-div">
            <div className="left-column">
                <img src={logo} alt="Logo" />
            </div>
            <div className="main-div">
                <h1>Models</h1>
                <ModelFilterBar />
                {makeTable()}
                </div>
        </div>
    );
}

const makeTable = () => {
    let header = createHeader();
    let body = createBody();

    return (
        <Table striped bordered hover>
            <thead>
                {header}
            </thead>
            {body}

        </Table>)
}

const createHeader = () => {
    let header = [];
    header.push(
        <th>#</th>
    )
    headerText.forEach(h => {
        header.push(
            <th>{h}</th>
        )
    })
    return (
        <tr>
            {header}
        </tr>
    )
}

const createBody = () => {
    let rows = [];
    let count = 1;
    modelData.forEach(currentData => {
        let rowElements = []
        rowElements.push(
            <td>{count}</td>
        )
        count++;
        keys.forEach(k => {
            rowElements.push(
                <td>{currentData[k]}</td>
            )
        })
        rowElements.push(
            <td><Button onClick={onDetailClicked} value={currentData.key}>More</Button></td>
        )
        let currentRow = (
            <tr>
                {rowElements}
            </tr>
        )
        rows.push(currentRow);
    })
    return (
        <tbody>
            {rows}
        </tbody>
    );
}

const onDetailClicked = (e) => {
    history.push(`/models/${e.target.value}`);
}

export default ModelTable;