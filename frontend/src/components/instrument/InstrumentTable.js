import React from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

import ExpiredIcon from "../../assets/CalibrationIcons/Expired.png";
import WarningIcon from "../../assets/CalibrationIcons/Warning.png";
import GoodIcon from "../../assets/CalibrationIcons/Good.png";
import NonCalibratableIcon from "../../assets/CalibrationIcons/Non-Calibratable.png";

const keys = ["vendor", "model number", "serial", "short description", "most recent callibration date"];
const headerTextArr = ["Vendor", "Model", "Serial", "Description", "Latest Calibration", "Calibration Expiration", "Status", "More", "Calibration Certificate"];

//Props
let data;   //prop array of data to display
let countStart; //prop int of the starting number to list for the first data point
//'onDetailRequested': function passed in prop that will be called on a more details button click
//'onCertificateRequested': function passed in prop that will be called on certificate button clicked
//'sortData' handler to call when a header is clicked for sorting

const instrumentTable = (props) => {
    data = props.data;
    countStart = props.countStart;
    let header = createHeader(props.sortData);
    let body = createBody(props.onDetailRequested, props.onCertificateRequested);

    return (
        <div className="data-table">
            <Table striped bordered hover>
                <thead>
                    {header}
                </thead>
                {body}

            </Table>
        </div>
    )

}

const createHeader = (onSortData) => {
    let header = [];
    header.push(
        <th>#</th>
    )
    headerTextArr.forEach(h => {
        header.push(
            <th onClick={() => onSortData(h)}>{h}</th>
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
    let count = countStart + 1;
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
        rowElements.push(<td>{getLatestCalibration(currentData)}</td>)

        rowElements.push(
            <td>{currentData.calibration_expiration}</td>
        )
        rowElements.push(
            <td>{getCalStatus(currentData)}</td>
        )
        rowElements.push(
            <td><Button value={currentData["pk"]} onClick={onDetailRequested}>More</Button></td>
        )
        rowElements.push(
            <td><Button value={currentData["pk"]} onClick={onCertificateRequested} disabled={currentData.calibration_event.length === 0}>Download</Button></td>
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

const getLatestCalibration = (currentData) => {
    if (currentData.item_model.calibration_frequency > 0) {
        if (currentData.calibration_event.length > 0) {
            return currentData.calibration_event[0].date;
        } else {
            return "No History";
        }
    } else {
        return "Non-Calibratable";
    }
}

const getCalStatus = (currentData) => {
    let icon;
    if (currentData.item_model.calibration_frequency > 0) {
        let expireDateString = currentData.calibration_expiration;
        if (currentData.calibration_event.length > 0) {
            let expireDate = new Date(expireDateString);
            let lasCalDate = new Date(currentData.calibration_event[0].date);
            let timeDifference = expireDate.getTime() - lasCalDate.getTime();
            let daysDifference = timeDifference / (1000 * 3600 * 24);
            if (daysDifference > 30) {
                icon = GoodIcon;
            }
            else if (daysDifference <= 30) {
                icon = WarningIcon;
            } else {
                icon = ExpiredIcon;
            }
        } else {
            icon = ExpiredIcon;
        }
    } else {
        icon = NonCalibratableIcon;
    }
    return (<img src={icon} className='calibration-status-icon' />)
}

instrumentTable.defaultProps = {
    data: []
}

export default instrumentTable;