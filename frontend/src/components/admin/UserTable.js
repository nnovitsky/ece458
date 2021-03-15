import React from 'react';
import DataTable from '../generic/DataTable';
import Button from 'react-bootstrap/Button';
import '../generic/ColumnSizeFormatting.css';
import PrivilegePicklist from '../generic/picklist/PrivilegePicklist.js';
import './Admin.css'
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';

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
    let config = makeConfig(countStart, props.deleteUser, props.giveAdminPriviledges, props.revokeAdminPriviledges, props.currentUser, props.onChangePrivileges);
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
                rowClasses="tall-rows"
/*                 cellEdit={ cellEditFactory({ 
                    mode: 'click', 
                    //blurToSave: true,
                    beforeSaveCell: (oldValue, newValue, row, column) => {
                        //row.groups.push(newValue)
                        console.log(newValue)
                        console.log(oldValue)
                        //console.log(row.groups)
                        //props.editUser(groups);
                    }
                }) } */
            />
            </div>

    )
}

let makeConfig = (countStart, deleteUser, giveAdminPriviledges, revokeAdminPriviledges, currentUser, onChangePrivileges) => {
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
                editable: () => {
                    return false;
                },
                formatExtraData: countStart,    // this is a way to pass in extra data (the fourth variable) to the formatter function
                headerClasses: 'num-column'     //css class applied to the header, defined in generic/ColumnSizeFormatting.css
            },
            {
                isKey: true,    //one column needs to be the keyfield, this has to be unique or the table has errors
                dataField: 'username',
                text: 'Username',
                sort: false,
                editable: () => {
                    return false;
                },
                title: (cell) => `Username: ${cell}`,   //text displayed when hovering over a cell
                headerClasses: 'at-username-column'
            },
            {
                dataField: 'a', //no field for just name but overwriting the display so it's ok
                text: 'Name',
                sort: false,
                editable: () => {
                    return false;
                },
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
                editable: () => {
                    return false;
                },
                title: (cell) => `Email: ${cell}`,
                headerClasses: 'at-email-column',
            },
            {
                dataField: 'delete',
                text: 'Delete User',
                editable: () => {
                    return false;
                },
                formatter: (cell, row) => {   //TODO change to oauth
                    let isHidden = (currentUser == row.username || row.groups.includes(oauthGroup) || row.username === overallAdminUsername)
                    return <Button onClick={deleteUser} value={row.pk} name={row.username} hidden={isHidden} className="data-table-button red">Delete</Button>;
                },
                headerClasses: 'at-delete-column',
            },
/*             {
                dataField: 'Priviledges',
                text: 'Administrator Priviledges',
                formatter: (cell, row) => {   //formats the data and the returned is displayed in the cell
                    let isHidden = (currentUser == row.username || row.username === overallAdminUsername)
                    let revokeButton = <Button onClick={revokeAdminPriviledges} value={row.pk} hidden={isHidden} className="data-table-button">Revoke</Button>
                    let giveButton = <Button onClick={giveAdminPriviledges} value={row.pk} hidden={isHidden} className="data-table-button">Grant</Button>
                    return <div>{ row.groups.includes(adminGroup) ? revokeButton : giveButton}</div>;
                },
            }, */
             {
                dataField: 'Picklist',
                text: 'Privileges',
                headerClasses: 'at-picklist-column top',
                formatter: (cell, row, rowIndex) => {   //formats the data and the returned is displayed in the cell
                    console.log(row)
                    return <div className="admin-filter-picklist"><PrivilegePicklist selectedPrivileges={row.groups} onChange={onChangePrivileges}/></div>;
                },
            }, 
/*             {
                dataField: 'groups',
                text: 'Administrator Picklist',
                editor: {
                    type: Type.SELECT,
                    multiple: true,
                    options: options
                  },
                  formatter: (cell, row) => {   //TODO change to oauth
                    console.log(row)
                    return <span>{getDisplayString(row.groups)}</span>;
                },
            }, */


        ]
    )
};

let getDisplayString = (groups) =>{
    let list = ""
    //console.log(groups)
    groups.forEach(element =>
        {
            console.log(element)
            switch(element){
                case "admin":
                    list = list + "Admin, "
                    break;
                case "oauth":
                    list = list + "Oauth, "
                    break;
            } 
        })
    return list;
}

export default userTable;

userTable.defaultProps = {
    data: [],
    inlineElements: <></>,
}