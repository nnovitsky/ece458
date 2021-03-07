import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';
import Button from 'react-bootstrap/Button';
import './Wizard.css'


const loadLevel = 'load'
let buttonArray =[]

const loadTable = (props) => {
    let data = props.data
    let config = makeConfig(props.onValidate);
    return (
        <div>
            <BootstrapTable
                remote
                bootstrap4
                condensed={true}
                data={data}
                keyField={loadLevel}
                columns={config}
                onTableChange={e => props.updateTable(data)}
                headerClasses='data-table-header'
                bodyClasses='data-table'
                rowClasses={rowStyle}
                cellEdit={
                    cellEditFactory({
                        mode: 'click',
                        autoSelectText: true,
                        beforeSaveCell: (oldValue, newValue, row, column) => { 
                            if(column.dataField == "ca")
                            {
                                row.ca = newValue
                            }
                            if(column.dataField == "cr")
                            {
                                row.cr = newValue
                            }
                            if(row.validate)
                            {
                                props.updateAllValidated(-1)
                                row.validate = false
                            }
                                row.cr_error = null
                                row.ca_error = null
                                row.cr_ok = false
                                row.ca_ok = false
                        }
                    })
                }
            />
        </div>
    )
}

let rowStyle = (row, rowIndex) => {
    if(typeof(row) !== 'undefined' && (row.validate || row.cr_ok && row.ca_ok))
    {
        return 'validated'
    }
    return 'notValidated';
}


let makeConfig = (onValidate) => {
    return (
        [
            {
                isKey: true,
                dataField: 'load',
                text: 'Load Level',
                headerClasses: 'format-width'
                //headerClasses: 'vendor-column'
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
                dataField: 'button',
                text: 'Check',
                sort: false,
                editable: () => {
                    return false;
                },
                formatter: (cell, row) => {
                    let button = <Button onClick={e => {onValidate(e).then(res => {
                                                            row.validate = res.validate
                                                        })}} value={row.load} className="data-table-button">Validate</Button>
                    buttonArray.push(button)
                    return (
                        button
                    )
                }
            },
            {
                dataField: 'ideal',
                text: 'Ideal Current',
                editable: () => {
                    return false;
                }
            },
            {
                dataField: 'cr_error',
                text: 'CR Error [%]',
                editable: () => {
                    return false;
                },
                formatter: (cell) => {
                    if(cell || cell == 0) return <span>{(Number(cell)* 100).toFixed(1) + "%"}</span>;
                    else return null;
                }
            },
            {
                dataField: 'cr_ok',
                text: 'CR Ok? [<3%]',
                editable: () => {
                    return false;
                },
                formatter: (cell) => {
                    if(cell) return <span>Yes</span>;
                    else return <span>No</span>
                }
            },
            {
                dataField: 'ca_error',
                text: 'CA Error [%]',
                editable: () => {
                    return false;
                },
                formatter: (cell) => {
                    if(cell || cell == 0) return <span>{(Number(cell)* 100).toFixed(1) + "%"}</span>;
                    else return null;
                }
                
            },
            {
                dataField: 'ca_ok',
                text: 'CA Ok? [<5%]',
                editable: () => {
                    return false;
                },
                formatter: (cell) => {
                    if(cell) return <span>Yes</span>;
                    else return <span>No</span>
                }
            },
        ]
    )
};

export default loadTable;