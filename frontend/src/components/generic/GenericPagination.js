import React from 'react';

import Pagination from 'react-bootstrap/Pagination';

//props
// 'currentPageNum'
// 'numPages'
// 'onClick' a handler that will be passed the page number desired
const genericPagination = (props) => {
    console.log(props)
    return (
        <Pagination>
            {/* <Pagination.First /> */}
            <Pagination.Prev disabled={props.currentPageNum === 1} />
            <Pagination.Item>{props.currentPageNum}</Pagination.Item>
            <Pagination.Next onClick={(e) => props.onClick(props.currentPageNum + 1)} disabled={props.currentPageNum === props.numPages} />
            {/* <Pagination.Last /> */}
        </Pagination>
    )
}

export default genericPagination;