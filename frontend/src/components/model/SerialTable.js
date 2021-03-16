import React from 'react';
import DataTable from '../generic/DataTable';
import Button from 'react-bootstrap/Button';
import "../generic/ColumnSizeFormatting.css";

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

// onMoreClicked: event handler for detail view requested, the event.target.value passed in is the pk
const keyField = 'pk';

const serialTable = (props) => {
    let countStart = (props.pagination.page - 1) * props.pagination.sizePerPage + 1;
    let config = makeConfig(countStart, props.onMoreClicked);
    return (
        <DataTable
            data={props.data}
            onTableChange={props.onTableChange}
            pagination={props.pagination}
            keyField={keyField}
            config={config}
            noResults='No Instrument Results'
        />


    )
}

let makeConfig = (countStart, onMoreClicked) => {
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
                headerClasses: 'st-num-column'
            },
            {
                dataField: 'asset_tag',
                text: 'Asset Tag',
                sort: false,
                title: (cell) => `Asset Tag: ${cell}, Click for more information about this instrument`,
                formatter: (cell, row) => {
                    return (
                        <Button onClick={onMoreClicked} value={row.pk} className="data-table-button">{cell}</Button>
                    )
                },
                headerClasses: 'st-asset-tag-column'
            },
            {
                dataField: 'serial_number',
                text: 'Serial Number',
                sort: false,
                title: (cell) => `Serial: ${cell}`,
                headerClasses: 'st-serial-number-column'
            },
        ]
    )
};

export default serialTable;

serialTable.defaultProps = {
    data: [],
}