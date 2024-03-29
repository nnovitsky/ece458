import React from 'react';
import DataTable from '../generic/DataTable';
import Button from 'react-bootstrap/Button';
import '../generic/ColumnSizeFormatting.css';
import '../generic/General.css';

import ExpiredIcon from "../../assets/CalibrationIcons/Expired.png";
import WarningIcon from "../../assets/CalibrationIcons/Warning.png";
import GoodIcon from "../../assets/CalibrationIcons/Good.png";
import NonCalibratableIcon from "../../assets/CalibrationIcons/Non-Calibratable.png";
import { Link } from 'react-router-dom';

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
// inlineElements: elements to be inline withe pagination components on the top of the screen
// isSelecting: optional that defaults to false, boolean if row selection is happening
    //the following are required if isSelecting is true
    //handleSelect: an event handler that will be called on a select/deselect
    //handleSelectAll: an event handler that will be called on select/deselct all
    //selected: an array of the keyfield values of all selected rows
    //isSelectAllChecked: boolean if check all checkbox should be checked
const keyField = 'pk';

const instrumentTable = (props) => {
    let countStart = (props.pagination.page - 1) * props.pagination.sizePerPage + 1;
    let config = makeConfig(countStart, props.onCertificateRequested, );
    const selectRow = props.isSelecting ? {
        selected: props.selected,
        onSelect: props.handleSelect,
        onSelectAll: props.handleSelectAll,
        isSelectAllChecked: props.isSelectAllChecked,
        isHidden: !props.isSelecting,
        nonSelectable: (!props.isSelecting ? props.data.map(x => x.pk) : [])
    } : null;
    
    return (
        <DataTable
            data={props.data}
            onTableChange={props.onTableChange}
            pagination={props.pagination}
            keyField={keyField}
            config={config}
            noResults='No Instrument Results'
            inlineElements={props.inlineElements}
            selectRow={selectRow}
        />


    )
}

const getLatestCalText = (data) => {
    if (data.calibration_expiration === "Uncalibratable.") {
        return "Uncalibratable"
    } else {
            if (data.calibration_event.length > 0) {
                return data.calibration_event[0].date;
            } else {
                return "No History";
            }
    }
}

const getDayDifference = (currentData) => {
    let expireDateString = currentData.calibration_expiration;
    let expireDate = new Date(expireDateString);
    let today = new Date();
    let timeDifference = expireDate.getTime() - today.getTime();
    let daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return daysDifference;
}

const isUncalibratable = (rowData) => {
    return rowData.calibration_expiration === "Uncalibratable.";
}

const hasEventHistory = (rowData) => {
    return rowData.calibration_event.length > 0;
}

    const getCalStatusIcon = (currentData) => {
        let result = {
            icon: '',
            text: '',
            dayDifference: '',
        }

        if (isUncalibratable(currentData)) {
            result.icon = NonCalibratableIcon;
            result.text = `Instrument is not calibratable`;
        } else {
            if (hasEventHistory(currentData)) {
                const daysDifference = getDayDifference(currentData);
                result.dayDifference = daysDifference;
                if (daysDifference > 30) {
                    result.icon = GoodIcon;
                    result.text = `Good: expires in ${daysDifference} days`;
                }
                else if (daysDifference <= 30 && daysDifference > 1) {
                    result.icon = WarningIcon;
                    result.text = `Warning: expires in ${daysDifference} days`;
                } else if (daysDifference === 1) {
                    result.icon = WarningIcon;
                    result.text = `Warning: expires in 1 day`;
                } 
                else if (daysDifference === 0){
                    result.icon = WarningIcon;
                    result.text = `Warning: expires today`;
                }else{
                    result.icon = ExpiredIcon;
                    result.text = `Warning: this calibration is expired`;
                }
            } else {
                result.icon = ExpiredIcon;
                result.text = `No calibration history`;
            }
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
                    title: (cell, row, rowIndex, countStart) => {   //formats the data and the returned is displayed in the cell
                        let rowNumber = (countStart + rowIndex);
                        return `#${rowNumber+1}`;
                    },
                    formatExtraData: countStart,    // this is a way to pass in extra data (the fourth variable) to the formatter function
                    headerClasses: 'it-num-column'
                },
                {
                    dataField: 'asset_tag',
                    text: 'Asset #',
                    sort: true,
                    title: (cell) => `Asset Tag Number: ${cell}. Click to see more`,
                    formatter: (cell, row) => {
                        return <Link to={`/instruments-detail/${row.pk}`} className="green-link">{cell}</Link>
                    },
                    headerClasses: 'it-asset-column'
                },
                {
                    dataField: 'item_model.vendor',
                    text: 'Vendor',
                    sort: true,
                    title: (cell) => `Vendor: ${cell}`,
                    headerClasses: 'it-vendor-column'
                },
                {
                    dataField: 'item_model.model_number',
                    text: 'Model #',
                    sort: true,
                    title: (cell) => `Model Number: ${cell}`,
                    headerClasses: 'it-model-number-column'
                },
                {
                    dataField: 'item_model.description',
                    text: 'Description',
                    sort: true,
                    title: (cell) => `Model Description: ${cell}`,
                    headerClasses: 'it-description-column',
                },
                {
                    dataField: 'categories.item_model_categories',
                    text: 'Model Categories',
                    sort: false,
                    title: (cell) => {
                        let contents;
                        if (cell[0] === null) {
                            contents = 'None'
                        } else {
                            contents = cell.join(', ');
                        }
                        return `Model Categories: ${contents}`
                    },
                    headerClasses: 'it-model-category-column',
                    formatter: (cell) => {
                        return (
                            <span>{cell.join(', ')}</span>
                        )
                    }
                },
                {
                    dataField: 'serial_number',
                    text: 'Serial #',
                    sort: true,
                    title: (cell) => {
                        let text;
                        if(cell !== null) {
                            text = cell;
                        } else {
                            text = 'None'
                        }
                        return `Serial Number: ${text}`
                    },
                    headerClasses: 'it-serial-number-column',
                },

                {
                    dataField: 'categories.instrument_categories',
                    text: 'Instrument Categories',
                    sort: false,
                    
                    title: (cell) => {
                        let contents;
                        if (cell[0] === null) {
                            contents = 'None'
                        } else {
                            contents = cell.join(', ');
                        }
                    return `Instrument Categories: ${contents}`
                    },
                    headerClasses: 'it-instrument-category-column',
                    formatter: (cell) => {
                        return (
                            <span>{cell.join(', ')}</span>
                        )
                    }
                },
                {
                    dataField: 'latest_calibration',
                    text: 'Last Cal.',
                    sort: true,
                    formatter: (cell, row) => {   //formats the data and the returned is displayed in the cell
                        let display = getLatestCalText(row);
                        if (row.calibration_event.length === 0) {
                            return <span>{display}</span>
                        } else {
                            return <Button onClick={onCertificateRequested} value={row.pk} id={row.asset_tag} className="data-table-button" hidden={row.calibration_event.length === 0}>{display}</Button>
                        }

                    },
                    title: (cell, row) => 
                    {
                        let display = getLatestCalText(row);
                        if (row.calibration_event.length === 0) {
                            return `Last Calibration: ${display}`;
                        } else {
                            return `Last Calibration: ${display}, click to download certificate`;
                        }
                        
                },
                    headerClasses: 'it-latest-calibration-column',
                },
                {
                    dataField: 'calibration_expiration',
                    text: 'Cal. Expiration',
                    sort: true,
                    title: (cell, row) => {
                        const text = getCalStatusIcon(row).text;
                        const displayCell = (cell.includes('Uncalibratable') ? 'None' : cell);
                        return `Expiration: ${displayCell}\n${text}`;
                    },
                    formatter: (cell, row) => {   //formats the data and the returned is displayed in the cell
                        let display = cell;
                        let result = getCalStatusIcon(row);
                        if (cell === 'Instrument not calibrated.') {
                            display = 'No History';
                        } else if(cell === 'Uncalibratable.') {
                            display = 'Uncalibratable';
                        }

                        return <div style={{display: "flex"}}>
                            {display}
                            <img src={result.icon} alt={result.text} className='status-icon' />
                        </div>;
                    },
                    headerClasses: 'it-calibration-expiration-column',
                },
            ]
        )
    }


    export default instrumentTable;

    instrumentTable.defaultProps = {
        data: [],
        isSelecting: false,
        handleSelect: () => {},
        handleSelectAll: () => {},
        selected: [],
    }