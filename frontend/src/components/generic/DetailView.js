import React from 'react';
import './DetailView.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import LogoTitleHeader from './LogoTitleHeader';
import GenericLoader from './GenericLoader';

// props
// title: a string to be displayed at the top of the page
// headerButtons: a list or object of buttons to be displayed next to the header
// col5: an element (likely a detail table) displayed in the column of 5
// comments: a string of comments that will be displayed next to col 5
// bottomElement: an element that will be on the bottom of the page, eg a calibration history table
// isLoading: boolean if the page is loading
const detailView = (props) => {

    return (
        <div>
            <GenericLoader isShown={props.isLoading}></GenericLoader>
            <div className="background">
                <div className="row mainContent">
                    <LogoTitleHeader
                        title={props.title}
                        headerButtons={props.headerButtons}
                    />
                    <div className="detail-view">


                        {/* <div className="col-2 text-center button-col">
                            
                            
                            </div> */}
                        <div className="instrument-info-block">
                            <Row>
                                <Col className="col-5">
                                    {props.col5}
                                </Col>
                                <Col className="col-7">
                                    <Table size="sm" bordered>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <strong>Comments</strong>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="detail-view-comment">
                                                        {props.comments}
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>

                        </div>
                        <hr />
                        <div className="bottom-element">
                            {props.bottomElement}
                        </div>

                    </div>

                </div>

            </div>
        </div>
        
    )
}

export default detailView;