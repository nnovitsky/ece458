import React from 'react';
import DataTable from '../generic/DataTable';
import Button from 'react-bootstrap/Button';
import '../generic/ColumnSizeFormatting.css';

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

const userTable = (props) => {
    let countStart = (props.pagination.page - 1) * props.pagination.sizePerPage + 1;
    let config = makeConfig(countStart, props.giveAdminPriviledges, props.revokeAdminPriviledges, props.currentUser);
    return (
        <DataTable
            data={props.data}
            onTableChange={props.onTableChange}
            pagination={props.pagination}
            keyField={keyField}
            config={config}
            noResults='No Users'
            inlineElements={props.inlineElements}
        />


    )
}

let makeConfig = (countStart, giveAdminPriviledges, revokeAdminPriviledges, currentUser) => {
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
                headerClasses: 'num-column'     //css class applied to the header, defined in generic/ColumnSizeFormatting.css
            },
            {
                isKey: true,    //one column needs to be the keyfield, this has to be unique or the table has errors
                dataField: 'username',
                text: 'Username',
                sort: false,
                title: (cell) => `Username: ${cell}`,   //text displayed when hovering over a cell
                headerClasses: 'username-column'
            },
            {
                dataField: 'a', //no field for just name but overwriting the display so it's ok
                text: 'Name',
                sort: false,
                title: (cell) => `Name: ${cell}`,
                headerClasses: 'name-column',
                formatter: (user, row) => {
                    return <span>{`${row.first_name} ${row.last_name}`}</span>
                }
            },
            {
                dataField: 'email',
                text: 'Email',
                sort: false,
                title: (cell) => `Email: ${cell}`,
                headerClasses: 'email-column',
            },
            {
                dataField: 'delete',
                text: 'Delete User',
                formatter: (cell, row) => {   //TODO change to oauth
                    console.log(row)
                    let isHidden = (currentUser == row.username || row.groups.includes(oauthGroup) || row.username === overallAdminUsername)
                    return <Button hidden={isHidden} className="data-table-button red">Delete</Button>;
                },
            },
            {
                dataField: 'Priviledges',
                text: 'Administrator Priviledges',
                formatter: (cell, row) => {   //formats the data and the returned is displayed in the cell
                    let isHidden = (currentUser == row.username || row.username === overallAdminUsername)
                    let revokeButton = <Button onClick={revokeAdminPriviledges} value={row.pk} hidden={isHidden} className="data-table-button">Revoke</Button>
                    let giveButton = <Button onClick={giveAdminPriviledges} value={row.pk} hidden={isHidden} className="data-table-button">Give</Button>
                    return <div>{ row.groups.includes(adminGroup) ? revokeButton : giveButton}</div>;
                },
            },
            // this could be helpful for adding a column that has a button link for deleting users, feel free to use or delete
            // {
            //     dataField: '#',  //can put a nonexistent field if it's not directly displaying the data
            //     text: 'More',
            //     sort: false,
            //     headerClasses: 'more-column',
            //     title: (cell) => 'Go to instrument detail view',
            //     formatter: (pk) => {
            //         return (
            //             <Button onClick={onMoreClicked} value={pk} className="data-table-button">More</Button>
            //         )
            //     }
            // },
        ]
    )
};

export default userTable;

userTable.defaultProps = {
    data: [],
    inlineElements: <></>,
}