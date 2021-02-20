import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './DataTable.css';


// props
// config = [{
//      isKey: true //needs to be true for ONE of the data fields, the rest can be omitted
//     dataField: "model_number",   //required
//     text: "Model Number",     //required
//     isSortable: true,                   //required
// }]

// data: json data array,
// onSort: event handler that will be passed the data field name and "asc" or "desc", only required if a column is sortable

let keyField;
const DataTable = (props) => {
    processConfig(props.config);
    return (
        <BootstrapTable
            data={props.data}
            columns={props.config}
            bootstrap4
            keyField={keyField}
        />
    )
}

const processConfig = (config) => {
    config.forEach(data => {
        if (data.isKey) {
            keyField = data.dataField;
        }
    })
}




export default DataTable;

DataTable.defaultProps = {
    data: [],
    onSort: () => { console.log("sorting attempt") }
}