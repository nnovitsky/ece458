import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import './Wizard.css'
import data from './LoadLevel.json'


const loadLevel = 'load_level'

const loadTable = (props) => {
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
                dataField: 'load_level',
                text: 'Load Level',
                headerClasses: 'format-width'
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
                dataField: 'ideal_current',
                text: 'Ideal Current',
            },
            {
                dataField: 'cr_error',
                text: 'CR Error [%]',
            },
            {
                dataField: 'cr_ok',
                text: 'CR Ok? [<3%]',
            },
            {
                dataField: 'ca_error',
                text: 'CA Error [%]',
            },
            {
                dataField: 'ca_ok',
                text: 'CA Ok? [<5%]',
            },
        ]
    )
};

export default loadTable;