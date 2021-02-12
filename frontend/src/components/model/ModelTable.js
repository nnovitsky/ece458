import React from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import './ModelTable.css'

const headerText = ["Model Number", "Vendor", "Description", "Comments", "Calibration (days)", "More"];
const keys = ["model_number", "vendor", "description", "comment", "calibration_frequency"];

//props
let data;   //prop of array of model data to display
//'onDetailRequested': function passed in prop that will be called when detail view is requested, will be passed model pk

const modelTable = (props) => {
    data = props.data;
    let header = createHeader(props.sortData);
    let body = createBody(props.onDetailRequested); 

    return (
        <div className="data-table">

            <Table striped bordered>
            <thead>
                {header}
            </thead>
            {body}

            </Table>
        </div>
    )
}

const onClickTableHeader = (onSortData, h) => {
    onSortData(h);

}


const createHeader = (onSortData) => {
    let header = [];
    header.push(
        <th>#</th>
    )
    headerText.forEach(h => {
        header.push(
            <th onClick={() => onClickTableHeader(onSortData, h)}>{h}</th>
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
            if ((k === "calibration_frequency") && (currentData[k] == 0)) {
                rowElements.push(
                    <td>N/A</td>)
            } else {
            rowElements.push(
                <td>{currentData[k]}</td>
            )
            }

        })
        rowElements.push(
            <td><Button onClick={onMoreClicked} value={currentData.pk}>More</Button></td>
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