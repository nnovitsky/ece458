import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import paginationFactory, { PaginationProvider, SizePerPageDropdownStandalone, PaginationListStandalone, PaginationTotalStandalone } from 'react-bootstrap-table2-paginator';

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
    let options = makeOptions(props.pagination.page, props.pagination.sizePerPage, props.pagination.totalSize, props.pagination.totalSize);
    console.log(props.countStart);
    return (
        <PaginationProvider
            pagination={paginationFactory(options)}
        >
            {
                ({
                    paginationProps,
                    paginationTableProps
                }) => (
                    <div>
                        <SizePerPageDropdownStandalone
                            {...paginationProps}
                        />
                        <PaginationListStandalone
                            {...paginationProps}
                        />
                        <PaginationTotalStandalone
                            {...paginationProps}
                        />
                        <BootstrapTable
                            data={props.data}
                            columns={config}
                            remote
                            bootstrap4
                            keyField={keyField}
                            onTableChange={props.onTableChange}
                            {...paginationTableProps}
                        />
                    </div>

                )}
        </PaginationProvider>


    )
}

const makeOptions = (page, sizePerPage, totalSize, totalResults) => {
    return ({
        custom: true,
        page: page,
        sizePerPage: sizePerPage,
        totalSize: totalSize,
        paginationSize: 4,
        pageStartIndex: 1,
        // alwaysShowAllBtns: true, // Always show next and previous button
        // withFirstAndLast: false, // Hide the going to First and Last page button
        // hideSizePerPage: true, // Hide the sizePerPage dropdown always
        // hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
        // firstPageText: 'First',
        // prePageText: 'Back',
        // nextPageTitle: 'First page',
        // prePageTitle: 'Pre page',
        // firstPageTitle: 'Next page',
        // lastPageTitle: 'Last page',
        showTotal: true,
        // paginationTotalRenderer: customTotal,
        disablePageTitle: true,
        sizePerPageRenderer,
        sizePerPageList: [{
            text: '10', value: 10
        }, {
            text: 'Show All', value: totalResults
        }] // A numeric array is also available. the purpose of above example is custom the text
    })
};

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

const sizePerPageRenderer = ({
    options,
    currSizePerPage,
    onSizePerPageChange
}) => (
    <div className="btn-group" role="group">
        {
            options.map((option) => {
                console.log(`Current Page: ${currSizePerPage} and checking ${option.page}`);
                const isSelect = currSizePerPage === `${option.page}`;
                return (
                    <button
                        key={option.text}
                        type="button"
                        onClick={() => onSizePerPageChange(option.page)}
                        className={`btn ${isSelect ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        { option.text}
                    </button>
                );
            })
        }
    </div>
);

const customTotal = (from, to, size) => (
    <span className="react-bootstrap-table-pagination-total">
        Showing { from} to { to} of { size} Results
    </span>
);


export default NewModelTable;

NewModelTable.defaultProps = {
    data: [],
}