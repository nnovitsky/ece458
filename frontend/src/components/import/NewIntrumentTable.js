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

// onCertificateRequested: handler for when a calibration certificate is requested
// onMoreClicked: event handler for detail view requested, the event.target.value passed in is the pk
// inlineElements: elements to be inline withe pagination components on the top of the screen
const keyField = 'pk';

const NewInstrumentTablePage = (props) => {
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
                {
                    isKey: true,
                    dataField: 'pk', //json data key for this column
                    text: '#',      //displayed column header text
                    formatter: (cell, row, rowIndex) => {   //formats the data and the returned is displayed in the cell
                        return <span>{rowIndex}</span>;
                    },
                },
                {
                    dataField: 'asset_tag',
                    text: 'Asset #',
                },
                {
                    dataField: 'item_model.vendor',
                    text: 'Vendor',
                },
                {
                    dataField: 'item_model.model_number',
                    text: 'Model #',
                },
                {
                    dataField: 'serial_number',
                    text: 'Serial #',
                },
                {
                    dataField: 'calibration_expiration',
                    text: 'Cal Expiration',
                },
            ]
        )
    }


    export default NewInstrumentTablePage;

    NewInstrumentTablePage.defaultProps = {
        data: [],
    }