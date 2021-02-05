import React from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

const headerText = ["Model Number", "Vendor", "Description", "Callibration (days)", "More"];
const keys = ["model_number", "vendor", "description", "callibration_frequency"];

//props
let data;   //prop of array of model data to display
//'onDetailRequested': function passed in prop that will be called when detail view is requested, will be passed model pk

const modelTable = (props) => {
    data = props.data;
    let header = createHeader();
    let body = createBody(props.onDetailRequested);

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

const createBody = (onMoreClicked) => {
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
            <td><Button onClick={onMoreClicked} value={currentData.key}>More</Button></td>
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

export default modelTable;