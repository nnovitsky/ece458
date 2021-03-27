import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';
import Button from 'react-bootstrap/Button';
import './Wizard.css'


const loadLevel = 'load'
let buttonArray =[]

const loadTable = (props) => {
    let data = props.data
    let config = makeConfig();
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
                        blurToSave: true,
                        beforeSaveCell: (oldValue, newValue, row, column) => { 
                            if(newValue !== '')
                            {
                                if(column.dataField == "ca")
                                {
                                    row.ca = newValue
                                }
                                if(column.dataField == "cr")
                                {
                                    row.cr = newValue
                                }                            
                                if(typeof(row.cr_error) !== 'undefined') row.cr_error = null;
                                if(typeof(row.ca_error) !== 'undefined') row.ca_error = null;
                                if(typeof(row.cr_ok) !== 'undefined') row.cr_ok = false;
                                if(typeof(row.ca_ok) !== 'undefined') row.ca_ok = false;
                            }

                            props.onValidate(row.load);
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
        return 'validated';
    }
    else if(typeof(row) !== 'undefined' && (typeof(row.cr_ok) === 'undefined' && typeof(row.ca_ok) === 'undefined'))
    {
        return 'blank';
    }
    return 'notValidated';
}


let makeConfig = () => {
    return (
        [
            {
                isKey: true,
                dataField: 'load',
                text: 'Load Level',
                headerClasses: 'format-width-load-level',
                classes: 'format-basic-cells'
            },
            {
                dataField: 'cr',
                text: 'Current Reported',
                classes: 'format-basic-cells',
                editorClasses: 'custom-class',
                headerClasses: 'input-headers'
            },
            {
                dataField: 'ca',
                text: 'Current Actual',
                classes: 'format-basic-cells',
                editorClasses: 'custom-class',
                headerClasses: 'input-headers',
            },
            {
                dataField: 'ideal',
                text: 'Ideal Current',
                classes: 'format-basic-cells',
                editable: () => {
                    return false;
                }
            },
            {
                dataField: 'cr_error',
                text: 'CR Error [%]',
                classes: 'format-basic-cells',
                editable: () => {
                    return false;
                },
                formatter: (cell, row) => {
                    if(row.cr_ok===true && row.ca_ok===true && row.load==="No load") return<span>N/A</span>;
                    if(cell || cell == 0) return <span>{(Number(cell)* 100).toFixed(1) + "%"}</span>;
                    else return null;
                }
            },
            {
                dataField: 'cr_ok',
                text: 'CR Ok? [<3%]',
                classes: 'format-basic-cells',
                editable: () => {
                    return false;
                },
                formatter: (cell) => {
                    if(cell) return <span>Yes</span>;
                    else if(typeof(cell) === 'undefined') return <span></span>;
                    else return <span>No</span>
                },
                headerClasses: 'short-headers'
            },
            {
                dataField: 'ca_error',
                text: 'CA Error [%]',
                classes: 'format-basic-cells',
                editable: () => {
                    return false;
                },
                formatter: (cell, row) => {
                    if(row.cr_ok===true && row.ca_ok===true && row.load==="No load") return<span>N/A</span>;
                    if(cell || cell == 0) return <span>{(Number(cell)* 100).toFixed(1) + "%"}</span>;
                    else return null;
                }
                
            },
            {
                dataField: 'ca_ok',
                text: 'CA Ok? [<5%]',
                classes: 'format-basic-cells',
                editable: () => {
                    return false;
                },
                formatter: (cell) => {
                    if(cell) return <span>Yes</span>;
                    else return <span>No</span>
                },
                headerClasses: 'short-headers'
            },
        ]
    )
};

export default loadTable;