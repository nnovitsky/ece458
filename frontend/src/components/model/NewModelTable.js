import React from 'react';
import DataTable from '../generic/DataTable';

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
const keyField = 'pk';

const NewModelTable = (props) => {
    let countStart = (props.pagination.page - 1) * props.pagination.sizePerPage + 1;
    let config = makeConfig(countStart);
    return (
        <DataTable
            data={props.data}
            onTableChange={props.onTableChange}
            pagination={props.pagination}
            keyField={keyField}
            config={config}
        />


    )
}

let makeConfig = (countStart) => {
    return (
        [
            // this is a column for a number for the table
            {
                dataField: '#',
                text: '#',
                formatter: (cell, row, rowIndex, countStart) => {
                    let rowNumber = (countStart + rowIndex);
                    return <span>{rowNumber}</span>;
                },
                formatExtraData: countStart
            },
            {
                dataField: 'vendor',
                text: 'Vendor',
                sort: true,
            },
            {
                dataField: 'model_number',
                text: 'Model Number',
                sort: true,
            },
            {
                dataField: 'description',
                text: 'Description',
                sort: true,
            },
            {
                dataField: 'calibration_frequency',
                text: 'Calibration Frequency',
            },
            {
                isKey: true,
                dataField: 'pk',
                text: 'More',
                formatter: (pk) => {
                    return (
                        <a href={`/models/${pk}`}>More</a>
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