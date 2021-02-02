import React from 'react';
import InstrumentServices from "../../api/instrumentServices";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

const keys = ["vendor", "model number", "serial", "short description", "most recent callibration date"];
const headerTextArr = ["Vendor", "Model", "Serial", "Description", "Last Callibration", "Next Callibration", "More", "Callibration Certificate"];

let data;

const InstrumentTable = () => {
    let instrumentServices = new InstrumentServices();
    data = instrumentServices.getInstruments();
    return (
       <div>
          <h1>Instrument Table</h1>
            {makeTable()}
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
    headerTextArr.forEach(h => {
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
    data.forEach(currentData => {
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
            <td>TBD</td>
        )
        rowElements.push(
            <td><Button value={currentData.key}>More</Button></td>
        )
        rowElements.push(
            <td><Button>Download</Button></td>
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

export default InstrumentTable;