import React from 'react';
import DataTable from '../generic/DataTable';
import "../generic/ColumnSizeFormatting.css";
import Button from 'react-bootstrap/Button';

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

//inlineElements: elements to be displayed next to the pagination component
// onSupplementDownload: an event handler to call when wanting a download, event.target.value is the cal event pk
const keyField = 'pk';

const calHistoryTable = (props) => {
    let countStart = (props.pagination.page - 1) * props.pagination.sizePerPage + 1;
    let config = makeConfig(countStart, props.onSupplementDownload);
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

let makeConfig = (countStart, onSupplementDownload) => {
    return (
        [
            // this is a column for a number for the table
            {
                dataField: 'pk', //json data key for this column
                isKey: true,
                text: '#',      //displayed column header text
                formatter: (cell, row, rowIndex, countStart) => {   //formats the data and the returned is displayed in the cell
                    let rowNumber = (countStart + rowIndex);
                    return <span>{rowNumber}</span>;
                },
                formatExtraData: countStart,    // this is a way to pass in extra data (the fourth variable) to the formatter function
                headerClasses: 'num-column'
            },
            {
                dataField: 'date',
                text: 'Date',
                sort: false,
                title: (cell) => `Calibration Date: ${cell}`,
                headerClasses: 'cal-column'
            },
            {
                dataField: 'file_name',
                text: 'Supplement Files',
                sort: false,
                title: (cell) => `Click to download the supplement file`,
                headerClasses: 'file-column',
                formatter: ((cell, row) => {
                    return (
                        <Button onClick={onSupplementDownload} value={row.pk} className="data-table-button">ADD ME</Button>
                    )
                })
            },
            {
                dataField: 'comment',
                text: 'Comment',
                sort: false,
                title: (cell) => `Comment: ${cell}`,
                headerClasses: 'comment-column'
            },
            {
                dataField: 'user',
                text: 'Name',
                sort: false,
                title: (cell) => `Name: ${cell}`,
                headerClasses: 'name-column',
                formatter: (user) => {
                    return <span>{`${user.first_name} ${user.last_name}`}</span>
                }
            },
            {
                dataField: 'user.username',
                text: 'Username',
                sort: false,
                title: (cell) => `Username: ${cell}`,
                headerClasses: 'username-column'
            },
        ]
    )
};

export default calHistoryTable;

calHistoryTable.defaultProps = {
    data: [],
    inlineElements: <></>
}