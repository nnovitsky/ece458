import React from 'react';
import DataTable from '../generic/DataTable';
import Button from 'react-bootstrap/Button';
import '../generic/ColumnSizeFormatting.css';
import PrivilegePicklist from '../generic/picklist/PrivilegePicklist.js';
import './Admin.css';
import PrivilegeChecks from './PrivilegeChecks.js';

// props
// data: json data object to be displayed

// onTableChange: event handler that will be passed information about pagination
// the handler function should accept inputs like: onTableChange(type, { page, sizePerPage })

// pagination: {
//     page: 1,    //current page
//     sizePerPage: 10, //results per page
//     totalSize: 12   //total num results
// }

// inlineElements: optional - elements to be displayed inline next to the total results/show all components, probs want that element to be float left


const keyField = 'pk';
const overallAdminUsername = 'admin'
const adminGroup = 'admin'
const oauthGroup = 'oauth'

const privilegesDisplayMap = {
    "admin": "Admin",
    "oauth": "Oauth",
}

const options = [{
    value: 'admin',
    label: 'Admin'
  }, {
    value: 'oauth',
    label: 'Oauth'
  }]

const userTable = (props) => {
    let countStart = (props.pagination.page - 1) * props.pagination.sizePerPage + 1;
    let config = makeConfig(countStart, props.deleteUser, props.currentUser, props.onChangePrivileges);
    return (
        <div>
            <DataTable
                data={props.data}
                onTableChange={props.onTableChange}
                pagination={props.pagination}
                keyField={keyField}
                config={config}
                noResults='No Users'
                inlineElements={props.inlineElements}
                isHoverMessageDisplayed={false}
            />
            </div>

    )
}

let makeConfig = (countStart, deleteUser, currentUser, onChangePrivileges) => {
    return (
        [
            // this is a column for a number for the table
            {

                dataField: '#', //json data key for this column
                text: '#',      //displayed column header text
                formatter: (cell, row, rowIndex, countStart) => {   //formats the data and the returned is displayed in the cell
                    let rowNumber = (countStart + rowIndex);
                    return <span>{rowNumber}</span>;
                },
                formatExtraData: countStart,    // this is a way to pass in extra data (the fourth variable) to the formatter function
                headerClasses: 'at-num-column'     //css class applied to the header, defined in generic/ColumnSizeFormatting.css
            },
            {
                isKey: true,    //one column needs to be the keyfield, this has to be unique or the table has errors
                dataField: 'username',
                text: 'Username',
                sort: false,
                title: (cell) => `Username: ${cell}`,   //text displayed when hovering over a cell
                headerClasses: 'at-username-column',
            },
            {
                dataField: 'a', //no field for just name but overwriting the display so it's ok
                text: 'Name',
                sort: false,
                title: (cell, row) => `Name: ${row.first_name} ${row.last_name}`,
                headerClasses: 'at-name-column',
                formatter: (user, row) => {
                    return <span>{`${row.first_name} ${row.last_name}`}</span>
                }
            },
            {
                dataField: 'email',
                text: 'Email',
                sort: false,
                title: (cell) => `Email: ${cell}`,
                headerClasses: 'at-email-column',
            },
            {
                dataField: 'delete',
                text: 'Delete User',
                title: (cell, row) => {
                    if(currentUser == row.username) return "Cannot delete own profile";
                    if(row.groups.includes(oauthGroup)) return "Cannot delete OAuth user";
                    if(row.username === overallAdminUsername) return "Cannot delete super admin";
                },
                formatter: (cell, row) => {   //TODO change to oauth
                    let isDisabled = (currentUser == row.username || row.groups.includes(oauthGroup) || row.username === overallAdminUsername)
                    return <Button onClick={deleteUser} value={row.pk} name={row.username} disabled={isDisabled} className="data-table-button red">Delete</Button>;
                },
                headerClasses: 'at-delete-column',
            },
             {
                dataField: 'Picklist',
                text: 'Privileges',
                headerClasses: 'at-picklist-column top',
                formatter: (cell, row, rowIndex) => {   //formats the data and the returned is displayed in the cell
                    let isHidden = (currentUser == row.username || row.username === overallAdminUsername)
                    let hiddenText = currentUser == row.username ? "Cannot edit own privileges" : "Cannot edit super admin privileges";
                    let returnContent = isHidden ? <span style={{color: "#a5a8aa"}}>{hiddenText}</span> : <PrivilegeChecks groups={row.groups} pk={row.pk} onChange={onChangePrivileges}></PrivilegeChecks>
                return returnContent;
                },
            }, 
        ]
    )
};

export default userTable;

userTable.defaultProps = {
    data: [],
    inlineElements: <></>,
}