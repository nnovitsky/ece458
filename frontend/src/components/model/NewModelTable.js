import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import paginationFactory, { PaginationProvider, PaginationTotalStandalone, PaginationListStandalone } from 'react-bootstrap-table2-paginator';

// props
// data: json data object to be displayed
// onTableChange: event handler that will be passed information about sorting
// countStart: an int that will be the displayed number for the first row (ie 1 for page 1)
// 
// pagination: {
//     page: 1,    //current page
//     sizePerPage: 10, //results per page
//     totalSize: 12   //total num results
// }
const keyField = 'pk';

const NewModelTable = (props) => {
    let config = makeConfig(props.countStart);
    console.log(props.countStart);
    return (
        <PaginationProvider
            pagination={paginationFactory({ custom: true, totalSize: props.pagination.totalSize })}
        >
            {
                ({
                    paginationProps,
                    paginationTableProps
                }) => (
                    <div>
                        <PaginationTotalStandalone
                            {...paginationProps}
                        />
                        <PaginationListStandalone
                            {...paginationProps}
                        />
                        <BootstrapTable
                            data={props.data}
                            columns={config}
                            remote
                            bootstrap4
                            keyField={keyField}
                            pagination={paginationFactory(props.pagination)}
                            onTableChange={props.onTableChange}
                            {...paginationTableProps}
                        />
                    </div>
                )
            }
        </PaginationProvider>

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
}


export default NewModelTable;

NewModelTable.defaultProps = {
    data: [],
}