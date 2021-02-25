import React from 'react';
import './DetailView.css';
import LogoTitleHeader from './LogoTitleHeader';

// props
// title: a string to be displayed at the top of the page
// headerButtons: a list or object of buttons to be displayed next to the header
// col5: an element (likely a detail table) displayed in the column of 5
// comments: a string of comments that will be displayed next to col 5
// bottomElement: an element that will be on the bottom of the page, eg a calibration history table
const detailView = (props) => {

    return (
        <div className="background">
            <div className="mainContent">
                <div className="detail-view">


                    {/* <div className="col-2 text-center button-col">
                            
                            
                            </div> */}
                    <div className="instrument-info-block">
                        <LogoTitleHeader
                            title={props.title}
                            buttons={props.headerButtons}
                        />

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
                    {displayedCalibrationData}
                </div>

            </div>

        </div>
    )
}

export default detailView;