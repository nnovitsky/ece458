import React from 'react';
import DataTable from '../generic/DataTable';
import "../generic/ColumnSizeFormatting.css";
import Button from 'react-bootstrap/Button';

import RejectedIcon from "../../assets/CalibrationIcons/Expired.png";
import PendingIcon from "../../assets/CalibrationIcons/Warning.png";
import ApprovedIcon from "../../assets/CalibrationIcons/Good.png";
import NonapplicableIcon from "../../assets/CalibrationIcons/Non-Calibratable.png";

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

//inlineElements: elements to be displayed next to the pagination component
// onSupplementDownload: an event handler to call when wanting a download, event.target.value is the cal event pk
// onLoadBankClick: an event handler to call when wanting to see the load bank cal data, event.target.value is the cal event pk
// onKlufeClick: an event handler to call when wanting to see the guided hardware cal data, event.target.value is the cal event pk
// requiresApproval: boolean if the table is going to be including requires approval
// onRowClick: an event handler that will be called with the calibration event
// hasApprovalPermissions: boolean if the pending should show a link
const keyField = 'pk';

const calHistoryTable = (props) => {
    let countStart = (props.pagination.page - 1) * props.pagination.sizePerPage + 1;
    let config = makeConfig(countStart, props.onSupplementDownload, props.onLoadBankClick, props.onKlufeClick, props.onFormClick, props.requiresApproval, props.hasApprovalPermissions, props.onRowClick);
    return (
        <DataTable
            data={props.data}
            onTableChange={props.onTableChange}
            pagination={props.pagination}
            keyField={keyField}
            config={config}
            noResults='No Calibration History'
            inlineElements={props.inlineElements}
            isHoverMessageDisplayed={false}
            rowClasses={rowClasses}
            striped={false}
        />
    )
}

const getApprovalStatusIcon = (approvalStatus) => {
    switch(approvalStatus) {
        case 'Approved':
            return ApprovedIcon;
        case 'Rejected':
            return RejectedIcon;
        case 'Pending':
            return PendingIcon;
        default:
            return NonapplicableIcon;
    }
}

let makeConfig = (countStart, onSupplementDownload, onLoadBankClick, onKlufeClick, onFormClick, requiresApproval, hasApprovalPermissions, onRowClick) => {
    return (
        [
            // this is a column for a number for the table
            {
                dataField: 'pk', //json data key for this column
                isKey: true,
                text: '#',      //displayed column header text
                formatter: (cell, row, rowIndex, countStart) => {   //formats the data and the returned is displayed in the cell
                    let rowNumber = (countStart + rowIndex);
                    return <span>{rowNumber}</span>;
                },
                title: (cell, row, rowIndex, countStart) => {   //formats the data and the returned is displayed in the cell
                    let rowNumber = (countStart + rowIndex);
                    return `#${rowNumber + 1}`;
                },
                formatExtraData: countStart,    // this is a way to pass in extra data (the fourth variable) to the formatter function
                headerClasses: 'ct-num-column',
                events: {
                    onClick: (e, column, columnIndex, row, rowIndex) => {
                        onRowClick(row)
                    },
                },
            },
            {
                hidden: !requiresApproval,
                dataField: 'approval_status', //json data key for this column
                isKey: true,
                text: 'Status',      //displayed column header text
                title: (cell) => {   //formats the data and the returned is displayed in the cell
                    switch(cell) {
                        case 'NA':
                            return 'Approval Status: Approved\nThis instrument was implicitly approved when the model was changed to requiring approval';
                        default:
                            return `Approval Status: ${cell}`
                    }
                },
                formatter: (cell, row, rowIndex, hasApprovalPermissions) => {
                    switch(cell) {
                        case 'NA':
                            return <span>Approved</span>
                        default:
                            return <div style={{ display: "flex" }}>
                                {cell}
                            </div>;
                    }
                    
                },
                style: (cell) => {
                    if (cell === 'Pending') {
                        return {
                            backgroundColor: '#FFFF00'
                        };
                    }
                },
                formatExtraData: hasApprovalPermissions,
                headerClasses: 'ct-status-column',
                classes: 'ct-status-column',
                events: {
                    onClick: (e, column, columnIndex, row, rowIndex) => {
                        onRowClick(row)
                    },
                },
            },
            {
                dataField: 'date',
                text: 'Date',
                sort: false,
                title: (cell) => `Calibration Date: ${cell}`,
                headerClasses: 'ct-cal-column',
                events: {
                    onClick: (e, column, columnIndex, row, rowIndex) => {
                        onRowClick(row)
                    },
                },
            },
            {
                dataField: 'file_type',
                text: 'Supplement Data',
                sort: false,
                title: (cell) => {
                    switch (cell) {
                        case 'None':
                            return 'No supplement documents';
                        case 'Artifact':
                            return `Supplement file: click to download`;
                        case 'Load Bank':
                            return 'Load Bank Data: click to view';
                        case 'Klufe':
                            return 'Guided Hardware Data: click to view';
                        case 'Form':
                            return 'Guided Hardware Data: click to view';
                        default:
                            return 'No supplement documents';
                    }

                },
                headerClasses: 'ct-file-column',
                formatter: ((cell, row) => {
                    switch (cell) {
                        case 'None':
                            return <span style={{padding: "1px 3px 1px 3px"}}>-</span>;
                        case 'Artifact':
                            return <Button onClick={onSupplementDownload} value={row.pk} className="data-table-button">Uploaded File</Button>
                        case 'Load Bank':
                            return <Button onClick={onLoadBankClick} value={row.lb_cal_pk} className="data-table-button">Load Bank Data</Button>
                        case 'Klufe':
                            return <Button onClick={onKlufeClick} value={row.klufe_cal_pk} className="data-table-button">Guided Hardware Data</Button>
                        case 'Form':
                            return <Button onClick={onFormClick} value={row.pk} className="data-table-button">Form Cal. Data</Button>
                        default:
                            return <span>N/A</span>
                    }
                }),
                events: {
                    onClick: (e, column, columnIndex, row, rowIndex) => {
                        if(row.file_type === 'None') {
                            onRowClick(row)
                        }
                    },
                },
            },
            {
                dataField: 'user',
                text: 'Name',
                sort: false,
                title: (cell) => `Name: ${cell.first_name} ${cell.last_name}`,
                headerClasses: 'ct-name-column',
                formatter: (user) => {
                    return <span>{`${user.first_name} ${user.last_name}`}</span>
                },
                events: {
                    onClick: (e, column, columnIndex, row, rowIndex) => {
                        onRowClick(row)
                    },
                },
                
            },
            {
                dataField: 'comment',
                text: 'Comment',
                sort: false,
                title: (cell) => `Comment: ${cell}`,
                headerClasses: 'ct-comment-column',
                events: {
                    onClick: (e, column, columnIndex, row, rowIndex) => {
                        onRowClick(row)
                    },
                },
            },
        ]
    )
};

const rowClasses = (row) => {
    let classes = 'can-click';

   switch(row.approval_status) {
       case 'Rejected':
            classes += ' rejected-row';
            break;
        case 'Pending':
            classes += ' pending-row';
            break
        default:
           classes += ' approved-row';
            break
   }

    return classes;
};

export default calHistoryTable;

calHistoryTable.defaultProps = {
    data: [],
    inlineElements: <></>
}