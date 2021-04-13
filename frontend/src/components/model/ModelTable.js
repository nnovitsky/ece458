import React from 'react';
import DataTable from '../generic/DataTable';
import "../generic/ColumnSizeFormatting.css";
import "../generic/General.css";
import { CalibrationModeDisplayMap } from '../generic/Util';
import { Link } from 'react-router-dom';

// props
// data: json data object to be displayed

// onTableChange: event handler that will be passed information about sorting and pagination
// the handler function should accept inputs like: onTableChange(type, { sortField, sortOrder, page, sizePerPage })
// sortfield/sortOrder can be omit if none of the fields are sortable

// pagination: {
//     page: 1,    //current page
//     sizePerPage: 10, //results per page
//     totalSize: 12   //total num results
// }

// onMoreClicked: event handler for detail view requested, the event.target.value passed in is the pk
// inlineElements: optional - elements to be displayed inline next to the total results/show all components, probs want that element to be float left
const keyField = 'pk';

const NewModelTable = (props) => {
    let countStart = (props.pagination.page - 1) * props.pagination.sizePerPage + 1;
    let config = makeConfig(countStart, props.onMoreClicked);
    console.log(props.data);
    return (
        <DataTable
            data={props.data}
            onTableChange={props.onTableChange}
            pagination={props.pagination}
            keyField={keyField}
            config={config}
            noResults='No Model Results'
            inlineElements={props.inlineElements}
        />


    )
}

let makeConfig = (countStart, onMoreClicked) => {
    return (
        [
            // this is a column for a number for the table
            {
                isKey: true,
                dataField: 'pk', //json data key for this column
                text: '#',      //displayed column header text
                formatter: (cell, row, rowIndex, countStart) => {   //formats the data and the returned is displayed in the cell
                    let rowNumber = (countStart + rowIndex);
                    return <span>{rowNumber}</span>;
                },
                title: (cell, row, rowIndex, countStart) => {   //formats the data and the returned is displayed in the cell
                    let rowNumber = (countStart + rowIndex);
                    return `#${rowNumber+1}`;
                },
                formatExtraData: countStart,    // this is a way to pass in extra data (the fourth variable) to the formatter function
                headerClasses: 'mt-num-column'
            },
            {
                dataField: 'vendor',
                text: 'Vendor',
                sort: true,
                title: (cell) => `Vendor: ${cell}`,
                headerClasses: 'mt-vendor-column'
            },
            {
                dataField: 'model_number',
                text: 'Model #',
                sort: true,
                title: (cell) => `Model Number: ${cell}, click to see more`,
                headerClasses: 'mt-model-number-column',
                formatter: (cell, row) => {
                    return (
                        <span>
                            <Link to={`/models-detail/${row.pk}`} className="green-link">{cell}</Link>
                        </span>
                    )
                }
            },
            {
                dataField: 'description',
                text: 'Description',
                sort: true,
                title: (cell) => `Description: ${cell}`,
                headerClasses: 'mt-description-column',
            },
            {
                dataField: 'categories.item_model_categories',
                text: 'Model Categories',
                sort: false,
                title: (cell) => {
                    let contents;
                    if (cell[0] === null) {
                        contents = 'None'
                    } else {
                        contents = cell.join(', ');
                    }
                    return `Model Categories: ${contents}`
                },
                headerClasses: 'mt-model-category-column',
                formatter: (cell) => {
                    return (
                        <span>{cell.join(', ')}</span>
                    )
                }
            },
            {
                dataField: 'calibration_frequency',
                text: 'Cal. Freq. (Days)',
                sort: true,
                title: (cell) => {
                    if (cell === 0) {
                        return `Cal. Frequency: N/A, non-calibratable`
                    } else {
                        return `Cal. Frequency: ${cell} days`
                    } 
                },
                headerTitle: () => `Calibration Frequency (Days)`,
                headerClasses: 'mt-cal-column',
                formatter: (cell) => {
                    if (cell === 0) {
                        return <span>N/A</span>
                    } else {
                        return <span>{cell}</span>
                    }
                }
            },
            {
                dataField: 'requires_approval',
                text: 'Requires Approval',
                sort: false,
                title: (cell, row) => {
                    if (row.calibration_frequency === 0) {
                        return `Uncalibratable\nRequires Approval: N/A`
                    } else {
                        return `Requires Calibration Approval: ${cell ? 'Yes' : 'No'}`;
                    }
                },
                headerTitle: () => `Calibration Validation Required`,
                headerClasses: 'mt-validation-column',
                formatter: (cell, row) => {
                    if (row.calibration_frequency === 0) {
                        return <span>N/A</span>
                    } else {
                        return <span>{cell ? 'Yes' : 'No'}</span>
                    }
                }
            },
            
            {
                dataField: 'calibration_modes',
                text: 'Cal. Mode',
                sort: false,
                title: (cell, row) => {
                    if (row.calibration_frequency === 0) {
                        return `Calibration Mode: Uncalibratable`;
                    } 
                    else if (cell[0] !== null) {
                        let result = cell.map(el => {
                            return CalibrationModeDisplayMap[el]
                        });
                        return `Calibration Mode: ${result}`;
                    } 
                    else {
                        return `Calibration Mode: Default`;
                    }
                    
                },
                formatter: (cell, row) => {
                    if (row.calibration_frequency === 0) {
                        return <span>Uncalibratable</span>
                    }
                    else if (cell[0] !== null) {
                        let result = cell.map(el => {
                            return CalibrationModeDisplayMap[el]
                        });
                        return (
                            <span>{result.join(',')}</span>
                        )
                    }
                    else {
                        return <span>Default</span>
                    }
                },
                headerTitle: () => `Calibration Mode`,
                headerClasses: 'mt-cal-mode-column',
            },
            {
                dataField: 'categories.calibrator_categories',
                text: 'Calibrator Categories',
                sort: false,
                title: (cell) => {
                    // let contents;
                    // if (cell[0] === null) {
                    //     contents = 'None'
                    // } else {
                    //     contents = cell.join(', ');
                    // }
                    // return `Calibrator Categories: ${contents}`
                },
                headerClasses: 'mt-model-category-column',
                formatter: (cell) => {
                    return (
                        <span>Coming soon</span>
                        // <span>{cell.join(', ')}</span>
                    )
                }
            },
            
        ]
    )
};

export default NewModelTable;

NewModelTable.defaultProps = {
    data: [],
}