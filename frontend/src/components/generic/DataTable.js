import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './DataTable.css';


// props
// config = [{
//      isKey: true //needs to be true for ONE of the data fields, the rest can be omitted
//     dataFieldName: "model_number",   //required
//     text: "Model Number",     //required
//     isSortable: true,                   //required
// }]

// data: json data array,
// onSort: event handler that will be passed the data field name and "asc" or "desc", only required if a column is sortable

const DataTable = (props) => {
    let columns = []
    return (
        <BootstrapTable
            keyField='model_number'
            data={props.data}
            columns={props.config}
            bootstrap4

        />
    )
}



export default DataTable;

DataTable.defaultProps = {
    data: [],
    onSort: () => { console.log("sorting attempt") }
}