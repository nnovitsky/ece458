import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import './DataTable.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import paginationFactory, { PaginationProvider, SizePerPageDropdownStandalone, PaginationListStandalone, PaginationTotalStandalone } from 'react-bootstrap-table2-paginator';

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

// keyField: one of the dataField attributes in the config is going to be the keyfield (needs to be unique)
// this prop will be that string

// config: this will be an array of json objects that will define what data populates the columns
// each json object will correspond to a column. here's a small example:
// [
//     {
//         dataField: 'vendor', //this is the key for the data value (can use a '.' to access a sub category eg. "item_model.model_number")
//         text: 'Vendor',  //the displayed column header
//         sort: true,      //determines if the column will be sortable
//     }
// ]
// there are examples throughout the repo, it's possible to format the displayed data, talk to carrie if running into trouble

const NewModelTable = (props) => {
    let options = makeOptions(props.pagination.page, props.pagination.sizePerPage, props.pagination.totalSize, props.pagination.totalSize);
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
                        <div className="pagination-row">
                            <SizePerPageDropdownStandalone
                                {...paginationProps}
                            />
                            <PaginationListStandalone
                                {...paginationProps}
                            />
                            <PaginationTotalStandalone
                                {...paginationProps}
                            />
                        </div>

                        <BootstrapTable
                            data={props.data}
                            columns={props.config}
                            remote
                            bootstrap4
                            keyField={props.keyField}
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
        paginationSize: 3,
        pageStartIndex: 1,
        alwaysShowAllBtns: true, // Always show next and previous button
        // withFirstAndLast: false, // Hide the going to First and Last page button
        // hideSizePerPage: true, // Hide the sizePerPage dropdown always
        hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
        // firstPageText: 'First',
        // prePageText: 'Back',
        // nextPageTitle: 'First page',
        // prePageTitle: 'Pre page',
        // firstPageTitle: 'Next page',
        // lastPageTitle: 'Last page',
        paginationTotalRenderer: customTotal,
        showTotal: true,
        disablePageTitle: true,
        sizePerPageRenderer,
        sizePerPageList: [{
            text: '10', value: 10
        }, {
            text: 'Show All', value: totalResults
        }] // A numeric array is also available. the purpose of above example is custom the text
    })
};

const customTotal = (from, to, size) => (
    <span className="react-bootstrap-table-pagination-total">
        { from} - { to} of { size}
    </span>
);

// displays the num results per page as a list of buttons instead of a dropdown
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

export default NewModelTable;

NewModelTable.defaultProps = {
    data: [],
}