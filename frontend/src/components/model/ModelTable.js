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

// onMoreClicked: event handler for detail view requested, the event.target.value passed in is the pk
const keyField = 'pk';

const NewModelTable = (props) => {
    let countStart = (props.pagination.page - 1) * props.pagination.sizePerPage + 1;
    let config = makeConfig(countStart, props.onMoreClicked);
    return (
        <DataTable
            data={props.data}
            onTableChange={props.onTableChange}
            pagination={props.pagination}
            keyField={keyField}
            config={config}
            noResults='No Model Results'
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
                headerClasses: 'num-column'
            },
            {
                dataField: 'vendor',
                text: 'Vendor',
                sort: true,
                title: (cell) => `Vendor: ${cell}`,
                headerClasses: 'vendor-column'
            },
            {
                dataField: 'model_number',
                text: 'Model #',
                sort: true,
                title: (cell) => `Model Number: ${cell}`,
                headerClasses: 'model-number-column'
            },
            {
                dataField: 'description',
                text: 'Description',
                sort: true,
                title: (cell) => `Description: ${cell}`,
                headerClasses: 'description-column',
            },
            {
                dataField: 'calibration_frequency',
                text: 'Cal. Frequency',
                sort: false,
                title: (cell) => `Cal. Frequency: ${cell} days`,
                headerTitle: () => `Calibration Frequency`,
                headerClasses: 'cal-column',
            },
            {
                isKey: true,
                dataField: 'pk',
                text: 'Details',
                sort: false,
                headerClasses: 'more-column',
                title: (cell) => `Go to model detail view`,
                formatter: (pk) => {
                    return (
                        <Button onClick={onMoreClicked} value={pk} className="data-table-button">More</Button>
                    )
                }
            }
        ]
    )
};

export default NewModelTable;

NewModelTable.defaultProps = {
    data: [],
}