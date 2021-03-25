import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import './GuidedCal.js'


const index = 'index'

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
                keyField={index}
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
                dataField: 'index',
                text: 'Test Number',
                headerClasses: 'gc-num-column'
            },
            {
                dataField: 'source_voltage',
                text: 'Source Voltage (V)',
                headerClasses: 'gc-sv-column'
            },
            {
                dataField: 'source_hertz',
                text: 'Source Frequency (Hz)',
                formatter: (cell, row) => {
                    if(row.source_hertz === null) return<span>N/A</span>;
                    else return<span>{row.source_hertz}</span>
                },
                headerClasses: 'gc-sf-column'
            },
            {
                dataField: 'reported_voltage',
                text: 'Display Voltage (V)',
                headerClasses: 'gc-dv-column'
            },
        ]
    )
};

export default displayTable;