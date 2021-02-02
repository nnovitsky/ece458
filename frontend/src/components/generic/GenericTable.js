import React from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

let data;   //array of data objects to display
let keys;   //array of keys for the data objects, should be in order desired
let headerTextArr;    //array of strings that will be displayed as the header, should be in order desired (should include headers for the button columns)
let buttonFunctions; //array of button functions, each button will get its own column
let buttonText; //array of text, each element will be the text in a button

const GenericTable = (props) => {
    data = props.data;
    keys = props.keys;
    headerTextArr = props.headers;
    buttonFunctions = props.buttonFunctions;
    buttonText = props.buttonText;

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

//takes in an array of models and an array of fields for those models
//it makes the body of the table, returning a <tb> filled element
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

export default GenericTable;