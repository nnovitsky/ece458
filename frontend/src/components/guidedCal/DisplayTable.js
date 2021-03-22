import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import './GuidedCal.js'


const loadLevel = 'voltage'

const displayTable = (props) => {
    let config = makeConfig();
    return (
        <div>
            <BootstrapTable
                remote
                bootstrap4
                striped
                condensed={true}
                data={props.data}
                keyField={loadLevel}
                columns={config}
                onTableChange={null}
                headerClasses='data-table-header'
                bodyClasses='data-table'
            />
        </div>
    )
}


let makeConfig = () => {
    return (
        [
            {
                isKey: true,
                dataField: 'load',
                text: 'Load Level',
                headerClasses: 'format-width-load-level'
            },
            {
                dataField: 'cr',
                text: 'Current Reported',
            },
            {
                dataField: 'ca',
                text: 'Current Actual',
            },
            {
                dataField: 'ideal',
                text: 'Ideal Current',
            },
        ]
    )
};

export default displayTable;