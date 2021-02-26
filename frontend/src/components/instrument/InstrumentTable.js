import React from 'react';
import DataTable from '../generic/DataTable';
import Button from 'react-bootstrap/Button';
import '../generic/ColumnSizeFormatting.css';
import '../generic/General.css';

import ExpiredIcon from "../../assets/CalibrationIcons/Expired.png";
import WarningIcon from "../../assets/CalibrationIcons/Warning.png";
import GoodIcon from "../../assets/CalibrationIcons/Good.png";
import NonCalibratableIcon from "../../assets/CalibrationIcons/Non-Calibratable.png";

// props
// data: json data object to be displayed

// onTableChange: event handler that will be passed information about sorting and pagination
// the handler function should accept inputs like: onTableChange(type, { sortField, sortOrder, page, sizePerPage })
// sortfield/sortOrder can be omit if none of the fields are sortable

// pagination: {
//     page: 1,    //current page
//     sizePerPage: 10, //results per page
//     totalSize: 12   //total num results
// }

// onCertificateRequested: handler for when a calibration certificate is requested
// onMoreClicked: event handler for detail view requested, the event.target.value passed in is the pk
// inlineElements: elements to be inline withe pagination components on the top of the screen
const keyField = 'pk';

const instrumentTable = (props) => {
    let countStart = (props.pagination.page - 1) * props.pagination.sizePerPage + 1;
    let config = makeConfig(countStart, props.onCertificateRequested, props.onMoreClicked);
    return (
        <DataTable
            data={props.data}
            onTableChange={props.onTableChange}
            pagination={props.pagination}
            keyField={keyField}
            config={config}
            noResults='No Instrument Results'
            inlineElements={props.inlineElements}
        />


    )
}

const getLatestCalText = (data) => {
    if (data.item_model.calibration_frequency > 0) {
        if (data.calibration_event.length > 0) {
            return data.calibration_event[0].date;
        } else {
            return "No History";
        }
    } else {
        return "Non-Calibratable";
    }
}


const getCalStatusIcon = (currentData) => {
    let result ={
        icon: '',
        text: '',
    }
    if (currentData.item_model.calibration_frequency > 0) {
        let expireDateString = currentData.calibration_expiration;
        if (currentData.calibration_event.length > 0) {
            let expireDate = new Date(expireDateString);
            let lasCalDate = new Date(currentData.calibration_event[0].date);
            let timeDifference = expireDate.getTime() - lasCalDate.getTime();
            let daysDifference = timeDifference / (1000 * 3600 * 24);
            if (daysDifference > 30) {
                result.icon = GoodIcon;
                result.text = `Good: expires in ${daysDifference} days`;
            }
            else if (daysDifference <= 30) {
                result.icon = WarningIcon;
                result.text = `Warning: expires in ${daysDifference} days`;
            } else {
                result.icon = ExpiredIcon;
                result.text = `Warning: this calibration is expired`;
            }
        } else {
            result.icon = ExpiredIcon;
            result.text = `Warning: this calibration is expired`;
        }
    } else {
        result.icon = NonCalibratableIcon;
        result.text = `Instrument is not calibratable`;
    }
    
    return (result)
}

let makeConfig = (countStart, onCertificateRequested, onMoreClicked) => {
    return (
        [
            // this is a column for a number for the table
            {
                dataField: '#', //json data key for this column
                text: '#',      //displayed column header text
                formatter: (cell, row, rowIndex, countStart) => {   //formats the data and the returned is displayed in the cell
                    let rowNumber = (countStart + rowIndex);
                    return <span>{rowNumber}</span>;
                },
                formatExtraData: countStart,    // this is a way to pass in extra data (the fourth variable) to the formatter function
                headerClasses: 'num-column'
            },
            {
                dataField: 'asset_number',
                text: 'Asset #',
                sort: true,
                title: (cell) => `Asset Number: ${cell}. Click to see more`,
                formatter: (cell, row) => {
                    return <span><a className="green-link" href={`/instruments/${row.pk}`}>ASSET</a></span>
                },
            },
            {
                dataField: 'item_model.vendor',
                text: 'Vendor',
                sort: true,
                title: (cell) => `Vendor: ${cell}`,
                headerClasses: 'vendor-column'
            },
            {
                dataField: 'item_model.model_number',
                text: 'Model #',
                sort: true,
                title: (cell) => `Model Number: ${cell}`,
                headerClasses: 'model-number-column'
            },
            {
                dataField: 'serial_number',
                text: 'Serial #',
                sort: true,
                title: (cell) => `Serial Number: ${cell}`,
                headerClasses: 'serial-number-column',
            },
            {
                dataField: 'item_model.description',
                text: 'Description',
                sort: true,
                title: (cell) => `Model Description: ${cell}`,
                headerClasses: 'description-column',
            },
            {
                dataField: 'latest_calibration',
                text: 'Latest Calibration',
                sort: true,
                formatter: (cell, row) => {   //formats the data and the returned is displayed in the cell
                    let display = getLatestCalText(row);
                    return <span>{display}</span>;
                },
                title: (cell, row) => `Latest Calibration: ${getLatestCalText(row)}`,
                headerClasses: 'latest-calibration-column',
            },
            {
                dataField: 'calibration_expiration',
                text: 'Calibration Expiration',
                sort: true,
                title: (cell) => `Calibration Expiration: ${cell}`,
                formatter: (cell, row) => {   //formats the data and the returned is displayed in the cell
                    let display = cell;
                    
                    if(cell === 'Instrument not calibrated.') {
                        display = 'Never Calibrated';
                    }
                    
                    return <span>{display}</span>;
                },
                headerClasses: 'calibration-expiration-column',
            },
            {
                dataField: 'icon',
                text: 'Status',
                sort: false,
                title: (cell, row) => {return(getCalStatusIcon(row).text)},
                formatter: (cell, row) => {   //formats the data and the returned is displayed in the cell
                    let result = getCalStatusIcon(row);
                    return <span><img src={result.icon} className='calibration-status-icon' /></span>;
                },
                headerClasses: 'status-column',   
            },
            {
                dataField: 'b',
                text: 'Calibration Certificate',
                sort: false,
                headerClasses: 'calibration-certificate-column',
                title: (cell) => 'Download Instrument Calibration Certificate',
                formatter: (cell, row) => {
                    return (
                        <Button onClick={onCertificateRequested} value={row.pk} className="data-table-button" hidden={row.calibration_event.length === 0}>Download</Button>
                    )
                }
            }
        ]
    )
};


export default instrumentTable;

instrumentTable.defaultProps = {
    data: [],
}