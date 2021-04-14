import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';


const label = 'label'

const simpleTable = (props) => {
    let config = makeConfig();
    return (
        <div>
            <BootstrapTable
                remote
                bootstrap4
                striped
                data={props.data}
                keyField={label}
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
                dataField: 'label',
                text: 'Prompt',
                style: { overflow: 'auto' }
            },
            {
                dataField: 'value',
                text: 'Reported Value',
                formatter: (cell) => {
                    console.log(cell)
                    if(cell === '' || cell === null || typeof(cell) === 'undefined') return <span>No input</span>;
                    else return cell
                }
            }
        ]
    )
};

export default simpleTable;