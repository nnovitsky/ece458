import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import '../generic/ColumnSizeFormatting.css';


const pk = 'pk'

const simpleTable = (props) => {
    let config = makeConfig();
    return (
        <div>
            <BootstrapTable
                remote
                bootstrap4
                striped
                data={props.data}
                keyField={pk}
                columns={config}
                onTableChange={null}
                headerClasses='data-table-header'
                bodyClasses='data-table cell-padding'
            />
        </div>
    )
}


let makeConfig = () => {
    return (
        [
            {
                isKey: true,
                dataField: pk,
                text: 'Order of Inputs',
                headerClasses: 'fc-num-column',
                formatter: (cell) => {
                    return <span>{cell}</span>
                },
            },
            {
                dataField: 'type',
                text: 'Type of Input',
                headerClasses: 'fc-even-column',
                formatter: (cell) => {
                    return <span>{cell}</span>
                },
            },
            {
                dataField: 'label',
                text: 'Prompt',
                style: { overflow: 'auto' },
                headerClasses: 'fc-even-column',
                formatter: (cell) => {
                    return <span>{cell}</span>
                },
            },
            {
                dataField: 'value',
                text: 'Reported Value',
                formatter: (cell) => {
                    console.log(cell)
                    if(cell === '' || cell === null || typeof(cell) === 'undefined') return <span>No input</span>;
                    else return cell
                },
                headerClasses: 'fc-even-column',
            }
        ]
    )
};

export default simpleTable;