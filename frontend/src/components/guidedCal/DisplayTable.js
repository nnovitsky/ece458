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
                dataField: 'index',
                text: 'Test Number',
                formatter: (cell, row) => {
                    return<span>{row.index + 1}</span>
                },
                headerClasses: 'gc-num-column',
            },
            {
                dataField: 'source_voltage',
                text: 'Source Voltage (V)',
                formatter: (cell, row) => {
                    return<span>{row.source_voltage}</span>
                },
                headerClasses: 'gc-sv-column'
            },
            {
                dataField: 'source_hertz',
                text: 'Source Frequency',
                formatter: (cell, row) => {
                    if(row.source_hertz === null) return<span>N/A</span>;
                    else return<span>{getHzString(row.source_hertz)}</span>
                },
                headerClasses: 'gc-sf-column'
            },
            {
                dataField: 'reported_voltage',
                text: 'Display Voltage (V)',
                formatter: (cell, row) => {
                    return<span>{row.reported_voltage}</span>
                },
                headerClasses: 'gc-dv-column'
            },
            {
                dataField: 'voltage_okay',
                text: 'Display Voltage Within Acceptable Range',
                formatter: (cell, row) => {
                    if(row.voltage_okay) return<span>Yes</span>;
                    else return<span>No</span>
                },
                headerClasses: 'gc-vo-column'
            },
        ]
    )
};

const getHzString  = (hz) => {
    const mega = 1000000
    const kilo = 1000

    if (hz >= mega) {
        return hz / mega + " MHz"
    }
    else if (hz >= kilo) {
        return hz / kilo + " kHz"
    }
    else {
        return hz + " Hz"
    }
}

export default displayTable;