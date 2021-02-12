import React from 'react';
import Button from 'react-bootstrap/esm/Button';

import Pagination from 'react-bootstrap/Pagination';
import Row from 'react-bootstrap/Row';

//props
// 'currentPageNum'
// 'numPages' number of pages
// 'numResults' number of results
// 'onShowAll' function to call when show all is called
// 'onPageClicked' a handler that will be passed the page number desired
// 'onShowAllToggle' a handler that will be called when the button is clicked
// 'isShown' if the pagination should be displayed
// 'buttonText' displayed button text

let lowerBound = 0;
let upperBound = 0;
const genericPagination = (props) => {
    console.log(props)
    setBounds(props.currentPageNum, props.numResults);
    return (
        <Row className="pagination">

            <Pagination hidden={!props.isShown}>
                {/* <Pagination.First /> */}
                <Pagination.Prev onClick={() => props.onPageClicked(props.currentPageNum - 1)} disabled={props.currentPageNum === "1"} />
                <Pagination.Item>{props.currentPageNum}</Pagination.Item>
                <Pagination.Next onClick={(e) => props.onPageClicked(props.currentPageNum + 1)} disabled={props.currentPageNum === props.numPages} />
                {/* <Pagination.Last /> */}
            </Pagination>
            <p>{(props.isShown) ? `${lowerBound} - ${upperBound} of ${props.numResults}` : `1-${props.numResults} of ${props.numResults}`}</p>
            <Button onClick={props.onShowAllToggle}>{props.buttonText}</Button>
        </Row>

    )
}

const setBounds = (currentPage, numResults) => {
    lowerBound = (currentPage - 1) * 10 + 1;
    upperBound = currentPage * 10;
    if (upperBound > numResults) {
        upperBound = numResults;
    }
}

export default genericPagination;