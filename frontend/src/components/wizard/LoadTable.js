import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import data from './LoadLevel.json'
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';
import Button from 'react-bootstrap/Button';
import './Wizard.css'


const loadLevel = 'load_level'
let buttonArray =[]

const loadTable = (props) => {
    let config = makeConfig(props.onValidate);
    return (
        <div>
            <BootstrapTable
                remote
                bootstrap4
                //striped
                condensed={true}
                data={props.data}
                keyField={loadLevel}
                columns={config}
                onTableChange={e => props.updateTable(data)}
                //onTableChange={onTableChange}
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
                                row.validate = false
                            }
                        }
                    })
                }
            />
        </div>
    )
}

let rowStyle = (row, rowIndex) => {
    if(typeof(row) !== 'undefined' && row.validate)
    {
        return 'validated'
    }
    return 'notValidated';
}

const onTableChange = (type, newState) => {
    console.log(type);
    console.log(newState);
  }


let makeConfig = (onValidate) => {
    return (
        [
            {
                isKey: true,
                dataField: 'load_level',
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
                text: 'Actual Current',
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
                                                        })}} value={row.load_level} className="data-table-button">Validate</Button>
                    buttonArray.push(button)
                    return (
                        button
                    )
                }
            },
            {
                dataField: 'ideal_current',
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
                }
            },
            {
                dataField: 'cr_ok',
                text: 'CR Ok? [<3%]',
                editable: () => {
                    return false;
                }
            },
            {
                dataField: 'ca_error',
                text: 'CA Error [%]',
                editable: () => {
                    return false;
                }
            },
            {
                dataField: 'ca_ok',
                text: 'CA Ok? [<5%]',
                editable: () => {
                    return false;
                }
            },
        ]
    )
};

export default loadTable;