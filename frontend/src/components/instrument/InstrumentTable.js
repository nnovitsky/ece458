import React from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

const keys = ["vendor", "model number", "serial", "short description", "most recent callibration date"];
const headerTextArr = ["Vendor", "Model", "Serial", "Description", "Last Callibration", "Next Callibration", "More", "Callibration Certificate"];

//Props
let data;   //prop array of data to display
//'onDetailRequested': function passed in prop that will be called on a more details button click
//'onCertificateRequested': function passed in prop that will be called on certificate button clicked

const instrumentTable = (props) => {
    data = props.data;
    let header = createHeader();
    let body = createBody(props.onDetailRequested, props.onCertificateRequested);

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

const createBody = (onDetailRequested, onCertificateRequested) => {
    let rows = [];
    let count = 1;
    data.forEach(currentData => {
        let rowElements = []
        rowElements.push(
            <td>{count}</td>
        )
        count++;
        rowElements.push(<td>{currentData.item_model.vendor}</td>);
        rowElements.push(<td>{currentData.item_model.model_number}</td>)
        rowElements.push(<td>{currentData.serial_number}</td>)
        rowElements.push(<td>{currentData.item_model.description}</td>)
        rowElements.push(<td>FIGURE ME OUT</td>)

        rowElements.push(
            <td>TBD</td>
        )
        rowElements.push(
            <td><Button value={currentData["pk"]} onClick={onDetailRequested}>More</Button></td>
        )
        rowElements.push(
            <td><Button value={currentData["pk"]} onClick={onCertificateRequested}>Download</Button></td>
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

export default instrumentTable;