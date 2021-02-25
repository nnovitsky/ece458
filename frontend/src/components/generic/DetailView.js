import React from 'react';
import './DetailView.css';


const detailView = (props) => {

    return (
        <div className="background">
            <div className="mainContent">
                <div className="detail-view">


                    {/* <div className="col-2 text-center button-col">
                            
                            
                            </div> */}
                    <div className="instrument-info-block">
                        <Row className="detail-header">
                            <img src={logo} alt="Logo" className="detail-logo" />
                            <h1>{`${this.state.instrument_info.vendor} ${this.state.instrument_info.model_number} (asset tag)`}</h1>
                            {this.props.is_admin ? adminButtons : null}
                        </Row>

                        <Row>
                            <Col className="col-5">{this.makeDetailsTable()}</Col>
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
                                                    {this.state.instrument_info.comment}
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