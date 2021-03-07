import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import './Wizard.css'


const loadLevel = 'load'

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
                dataField: 'load',
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
                dataField: 'ideal',
                text: 'Ideal Current',
            },
            {
                dataField: 'cr_error',
                text: 'CR Error [%]',
                formatter: (cell) => {
                    if(cell || cell == 0) return <span>{(Number(cell)* 100).toFixed(1) + "%"}</span>;
                    else return null;
                }
            },
            {
                dataField: 'cr_ok',
                text: 'CR Ok? [<3%]',
                formatter: (cell) => {
                    if(cell) return <span>Yes</span>;
                    else return <span>No</span>
                }
            },
            {
                dataField: 'ca_error',
                text: 'CA Error [%]',
                formatter: (cell) => {
                    if(typeof(cell) !== 'undefined') return <span>{(Number(cell)* 100).toFixed(1) + "%"}</span>;
                    else return null;
                }
                
            },
            {
                dataField: 'ca_ok',
                text: 'CA Ok? [<5%]',
                formatter: (cell) => {
                    if(cell) return <span>Yes</span>;
                    else return <span>No</span>
                }
            },
        ]
    )
};

export default loadTable;