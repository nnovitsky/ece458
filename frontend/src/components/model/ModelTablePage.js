import React from 'react';

import data from './sampleData.json';

import Table from 'react-bootstrap/Table'

const modelTable = () => {
    let dataArr = data.models;
    let fields = data.fields;
    return (
        <div>
            <h1>Model Table</h1>
            <p>This is where the table with all of our models would go</p>
            {makeTable(dataArr, fields)}
        </div>
    );
}

const makeTable = (dataArr, fields) => {
    let header = createHeader(fields);
    let body = createBody(dataArr, fields);

    return (
        <Table striped bordered hover>
            <thead>
                {header}
            </thead>
            {body}

        </Table>)
}

const createHeader = (fields) => {
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
const createBody = (dataArr, fields) => {
    let rows = [];
    let count = 1;
    dataArr.forEach(currentData => {
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

export default modelTable;