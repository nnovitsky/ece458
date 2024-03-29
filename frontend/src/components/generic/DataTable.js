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

//noResults: text to be displayed when no data is present

// isHoverMessageDisplayed: optional text about hovering over a cell, defaults to true
// inlineElements: optional - elements to be displayed inline next to the total results/show all components, probs want that element to be float left

// this is optional, but if select row is to be enabled, every props must be filled out
// selectRow: {
//     isHidden  //boolean set to true if the select column should be hidden
//     onSelect    // handler that will be called on a row being selected
//     onSelectAll //handler that will be called on select all being clicked
//     selected    //an array of keys (the field that is set to be the key for the table) of selected rows
//     isSelectAllChecked  //boolean if the select all checkbox should be checked
// }
// onRowClick: an optional event handler (defaults to null) that will be passed row information to the handler on a row being clicked
// rowClasses: optional, can either be a string of classes OR something like:
        // const rowClasses = (row, rowIndex) => {
        //     let classes = null;

        //     if (rowIndex > 2) {
        //         classes = 'index-bigger-than-two';
        //     }

        //     return classes;
        // };
// striped:optional boolean for if the table should have stripes, defaults to true
const NewModelTable = (props) => {
    let options = makeOptions(props.pagination.page, props.pagination.sizePerPage, props.pagination.totalSize, props.pagination.totalSize);
    const selectProps = props.selectRow;
    let selectRowProps = selectProps ? {
        mode: 'checkbox',
        clickToSelect: true,
        selected: selectProps.selected,
        onSelect: selectProps.onSelect,
        onSelectAll: selectProps.onSelectAll,
        hideSelectColumn: selectProps.isHidden,
        selectionHeaderRenderer: ({ mode, disabled }) => {
            return <input type={mode} checked={selectProps.isSelectAllChecked} disabled={disabled} />
        },
        classes: (props.selectRow.isHidden ? "" : "selection-row"),
    } : {
            mode: 'checkbox',
            clickToSelect: false,
            hideSelectColumn: true,
        };

    const hoverMessage = props.isHoverMessageDisplayed ? (<span>(Hover over a cell for more information)</span>) : null;
    let rowEvents = {};
    if (props.onRowClick) {
        rowEvents = {
            onClick: (e, row) => {
                props.onRowClick(row);
            }
        }
    }
    return (
        <div className="data-table">
            {hoverMessage}

            <PaginationProvider
                pagination={paginationFactory(options)}
            >
                {
                    ({
                        paginationProps,
                        paginationTableProps
                    },
                        totalAndShowAll = (
                            <div className="pagination-top-row">
                                {props.inlineElements}

                                {(props.pagination.totalSize < 25) ? null :
                                    <SizePerPageDropdownStandalone
                                        {...paginationProps}

                                    />
                                }
                                

                                {(props.pagination.totalSize === 0) ? null : (
                                    <>

                                        <PaginationTotalStandalone
                                            {...paginationProps}
                                        />
                                    </>)}


                            </div>),
                        paginationPages = (props.pagination.totalSize === 0) ? null : (<div className="" display={(props.pagination.totalSize === 0) ? 'none' : 'block'}>
                            <PaginationListStandalone
                                {...paginationProps}
                            />

                        </div>)
                    ) => (
                        <div>
                            {totalAndShowAll}
                            <BootstrapTable
                                remote
                                bootstrap4
                                striped={props.striped}
                                condensed={true}
                                data={props.data}
                                columns={props.config}
                                keyField={props.keyField}
                                onTableChange={props.onTableChange}
                                headerClasses='data-table-header'
                                bodyClasses='data-table'
                                {...paginationTableProps}
                                noDataIndication={noResults(props.noResults)}
                                rowClasses={props.rowClasses}
                                selectRow={selectRowProps}
                                rowEvents={rowEvents}
                            />
                            {paginationPages}
                        </div>

                    )}
            </PaginationProvider>
        </div>
    )
}

const noResults = (text) => {
    return (
        <div className="data-table-no-results">
            <h2>{text}</h2>
        </div>
    )
}

const makeOptions = (page, sizePerPage, totalSize, totalResults) => {
    const lastPage = Math.ceil(totalSize / sizePerPage);
    return ({
        custom: true,
        page: page,
        sizePerPage: sizePerPage,
        totalSize: totalSize,
        paginationSize: 3,
        pageStartIndex: 1,
        // alwaysShowAllBtns: true, // Always show next and previous button
        withFirstAndLast: true, // Hide the going to First and Last page button
        // hideSizePerPage: true, // Hide the sizePerPage dropdown always
        hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
        // firstPageText: 'First',
        // prePageText: 'Back',
        // nextPageTitle: 'First page',
        // prePageTitle: 'Pre page',
        firstPageText: '1 ...',
        lastPageText: `... ${lastPage}`,
        paginationTotalRenderer: customTotal,
        showTotal: true,
        disablePageTitle: true,
        // sizePerPageRenderer,
        sizePerPageList: [{
            text: 'Show 25', value: 25
        },
        {
            text: 'Show 50', value: 50
        },
        {
            text: 'Show 100', value: 100
        },
        {
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
    <div className="btn-group pagination-button-row" role="group">
        {
            options.map((option) => {
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
    inlineElements: <></>,
    cellEdit: false,
    rowClasses: '',
    selectRow: false,
    extraTableParams: {},
    isHoverMessageDisplayed: true,
    onRowClick: null,
    striped: true,
}