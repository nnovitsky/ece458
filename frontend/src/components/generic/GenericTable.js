import React from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

var jsonpath = require('jsonpath');

let data;   //array of data objects to display
let keys;   //array of json paths for the desired value, this should be from the current element in the arr (ask carrie if questions)
let headers;    //array of strings that will be displayed as the header, should be in order desired (should include headers for the button columns)
let buttonFunctions; //array of button functions, each button will get its own column
let buttonText; //array of text, each element will be the text in a button
let tableTitle; //optional prop, this would be the title of the table and will be displayed in the top row
let countStart; //optional prop that will be the count start of the first instrument

const GenericTable = (props) => {
    data = props.data;
    keys = props.keys;
    headers = props.headers;
    buttonFunctions = props.buttonFunctions;
    buttonText = props.buttonText;
    tableTitle = props.tableTitle;
    countStart = props.countStart;

    return (
        <div>
            {makeTable()}
        </div>
    );
}

const makeTable = () => {
    let header = createHeader();
    let body = createBody();

    return (
        <div className="data-table">
            <Table striped bordered size="sm">
                {header}
                {body}

            </Table>
        </div>
    )

}

const createHeader = () => {
    let header = [];
    header.push(
        <th>#</th>
    )
    headers.forEach(h => {
        header.push(
            <th>{h}</th>
        )
    })

    let title = null;
    if (tableTitle != null) {
        title = (
            <tr>
                <th colSpan={headers.length + 1} className="text-center">{tableTitle}</th>
            </tr>
        )
    }
    return (
        <thead>
            {title}
            <tr>
                {header}
            </tr>
        </thead>
    )
}

//takes in an array of models and an array of fields for those models
//it makes the body of the table, returning a <tb> filled element
const createBody = () => {
    let rows = [];
    let count = countStart;
    data.forEach(currentData => {
        let rowElements = []
        rowElements.push(
            <td>{count}</td>
        )
        count++;
        keys.forEach(k => {
            rowElements.push(
                <td>{jsonpath.query(currentData, k)}</td>
            )
        })
        buttonText.forEach((bt, i) => {
            rowElements.push(
                <td><Button onClick={buttonFunctions[i]} value={currentData.key}>{bt}</Button></td>
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

// const onDetailClicked = (e) => {
//     history.push(`/models/${e.target.value}`);
// }

GenericTable.defaultProps = {
    countStart: 1
}

export default GenericTable;