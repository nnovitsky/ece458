import React from 'react';

import Pagination from 'react-bootstrap/Pagination';
import Row from 'react-bootstrap/Row';

//props
// 'currentPageNum'
// 'numPages'
// 'onClick' a handler that will be passed the page number desired
const genericPagination = (props) => {
    console.log(props)
    return (
        <Row>
            <p>{`Showing Page ${props.currentPageNum} of ${props.numPages}`}</p>
            <Pagination>
                {/* <Pagination.First /> */}
                <Pagination.Prev disabled={props.currentPageNum === 1} />
                <Pagination.Item>{props.currentPageNum}</Pagination.Item>
                <Pagination.Next onClick={(e) => props.onClick(props.currentPageNum + 1)} disabled={props.currentPageNum === props.numPages} />
                {/* <Pagination.Last /> */}
            </Pagination>
        </Row>

    )
}

export default genericPagination;