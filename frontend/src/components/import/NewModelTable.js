import React from 'react';
import "../generic/ColumnSizeFormatting.css";
import "../generic/General.css";
import BootstrapTable from 'react-bootstrap-table-next';
import '../generic/DataTable.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import './ImportPage.css'

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
// inlineElements: optional - elements to be displayed inline next to the total results/show all components, probs want that element to be float left
const keyField = 'pk';

const NewModelTable = (props) => {
    let config = makeConfig();
    return (
        <div className="scrollable"> 
        <BootstrapTable
            remote
            bootstrap4
            striped
            data={props.data}
            columns={config}
            keyField={keyField}
            onTableChange={null}
            headerClasses='import-table-header'
            bodyClasses='import-table'
        />
        </div>
    )
}

let makeConfig = () => {
    return (
        [
            // this is a column for a number for the table
            {
                isKey: true,
                dataField: 'pk', //json data key for this column
                text: '#',      //displayed column header text
                headerClasses: 'mt-num-column'
            },
            {
                dataField: 'vendor',
                text: 'Vendor',
                headerClasses: 'mt-vendor-column'
            },
            {
                dataField: 'model_number',
                text: 'Model #',
                headerClasses: 'mt-model-number-column',
            },
            {
                dataField: 'description',
                text: 'Description',
                headerClasses: 'mt-description-column',
            },

            {
                dataField: 'calibration_frequency',
                text: 'Cal. Freq. (Days)',
                sort: true,
                headerClasses: 'mt-cal-column',
                formatter: (cell) => {
                    if (cell === 0) {
                        return <span>N/A</span>
                    } else {
                        return <span>{cell}</span>
                    }
                }
            },
        ]
    )
};

export default NewModelTable;

NewModelTable.defaultProps = {
    data: [],
}