import React from 'react';
import { useHistory } from "react-router-dom";
import ModelServices from "../../api/modelServices";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

let history;
const modelServices = new ModelServices();
const fields = ["model number", "vendor", "description", "callibration frequency"];


const ModelTable = () => {
    let data = modelServices.getModels();
    history = useHistory(data);
    return (
        <div>
            <h1>Model Table</h1>
            <p>This is where the table with all of our models would go</p>
            {makeTable(data)}
        </div>
    );
}

const makeTable = (data) => {
    let header = createHeader();
    let body = createBody(data);

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
    fields.forEach(f => {
        let upper = f.toUpperCase();
        header.push(
            <th>{upper}</th>
        )
    })
    return (
        <tr>
            {header}
        </tr>
    )
}

//takes in an array of models and an array of fields for those models
//it makes the body of the table, returning a <tb> filled element
const createBody = (data) => {
    let rows = [];
    let count = 1;
    data.forEach(currentData => {
        let rowElements = []
        rowElements.push(
            <td>{count}</td>
        )
        count++;
        fields.forEach(f => {
            rowElements.push(
                <td>{currentData[f]}</td>
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