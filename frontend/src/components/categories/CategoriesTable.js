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

// onCategoryEdit: event handler for editing category, the event.target.value passed in is the pk, event.target.currentName is the current category name
// onCategoryDelete: event handler for deleting category, the event.target.value passed in is the pk, event.target.currentName is the current category name

// inlineElements: optional prop that will put elements inline with the pagination
const keyField = 'pk';

const modelCategoriesTable = (props) => {
    let countStart = (props.pagination.page - 1) * props.pagination.sizePerPage + 1;
    let config = makeConfig(countStart, props.onCategoryEdit, props.onCategoryDelete);
    return (
        <DataTable
            data={props.data}
            onTableChange={props.onTableChange}
            pagination={props.pagination}
            keyField={keyField}
            config={config}
            noResults='No Model Results'
            inlineElements={props.inlineElements}
        />


    )
}

let makeConfig = (countStart, onCategoryEdit, onCategoryDelete) => {
    return (
        [
            // this is a column for a number for the table
            {
                isKey: true,
                dataField: 'pk', //json data key for this column
                text: '#',      //displayed column header text
                formatter: (cell, row, rowIndex, countStart) => {   //formats the data and the returned is displayed in the cell
                    let rowNumber = (countStart + rowIndex);
                    return <span>{rowNumber}</span>;
                },
                formatExtraData: countStart,    // this is a way to pass in extra data (the fourth variable) to the formatter function
                headerClasses: 'num-column'
            },
            {
                dataField: 'name',
                text: 'Category',
                sort: false,
                title: (cell) => `${cell}`,
                headerClasses: 'cm-category-column'
            },
            {
                dataField: 'count',
                text: 'Count',
                sort: false,
                title: (cell) => `Count of this category: ${cell}`,
                headerClasses: 'cm-count-column'
            },
            {
                dataField: 'edit',
                text: 'Edit',
                sort: false,
                headerClasses: 'cm-edit-column',
                title: (cell, row) => `Rename '${row.category}'`,
                formatter: (cell, row) => {
                    return (
                        <Button onClick={onCategoryEdit} value={row.pk} name={row.name} className="data-table-button">Rename</Button>
                    )
                }
            },
            {
                dataField: 'delete',
                text: 'Delete',
                sort: false,
                headerClasses: 'cm-delete-column',
                title: (cell, row) => `Delete '${row.category}'`,
                formatter: (cell, row) => {
                    return (
                        <Button onClick={onCategoryDelete} value={row.pk} name={row.name} className="data-table-button red">Delete</Button>
                    )
                }
            }
        ]
    )
};

export default modelCategoriesTable;

modelCategoriesTable.defaultProps = {
    data: [],
    inlineElements: null
}