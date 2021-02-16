import React from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import '../model/ModelTable.css'

const headerText = ["Model Number", "Vendor", "Description", "Comments", "Calibration Date"];
const keys = ["model_number", "vendor", "serial_number", "comment", "calibration_date"];
let lastSortedId = null;

//props
let data;   //prop of array of model data to display
let countStart; //prop of int of data count to start at
//'onDetailRequested': function passed in prop that will be called when detail view is requested, will be passed model pk
//'sortData' event handler to call when header is clicked


const importInstrumentTable = (props) => {
    data = props.data;
    countStart = props.countStart;
    let header = createHeader(props.sortData);
    let body = createBody(); 

    return (
        <div className="data-table">

            <Table striped bordered size="sm">
            <thead>
                {header}
            </thead>
            {body}

            </Table>
        </div>
    )
}

const onClickTableHeader = (e, onSortData, h) => {
    if (lastSortedId !== null) {
        document.getElementById(lastSortedId).style.backgroundColor = "white";
    }
    document.getElementById(e.target.id).style.backgroundColor = "rgb(147, 196, 127)";
    lastSortedId = e.target.id;
    onSortData(h);

}


const createHeader = (onSortData) => {
    let header = [];
    header.push(
        <th>#</th>
    )
    headerText.forEach(h => {
        header.push(
            <th onClick={(e) => onClickTableHeader(e, onSortData, h)} id={h}>{h}</th>
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
    let count = countStart + 1;
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

export default importInstrumentTable;