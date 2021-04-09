import React, { useState, useEffect, useReducer } from 'react';
import GenericPopup from '../generic/GenericPopup';
import Form from "react-bootstrap/Form";
import "react-datepicker/dist/react-datepicker.css";
import Table from 'react-bootstrap/esm/Table';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
//props
// calibrationEvent: calibration event from the cal event search
//'isShown': boolean if popup is shown
//'onClose': event handler for the popup being closed
//'onSubmit': event handler for the calibration being submitted, will contain the fields below
//'errors': an array of errors to display

const CalibrationPopup = (props) => {

    const [approvalState, dispatch] = useReducer(reducer, getEmptyState());

    console.log(props.calibrationEvent)
    const body = (
        <>
            {makeSummary(props.calibrationEvent, approvalState, dispatch)}
            {makeApprovalSection(props.calibrationEvent, approvalState, dispatch)}
        </>
    )
    return (
        <GenericPopup
            show={props.isShown}
            body={body}
            headerText="Calibration Event"
            closeButtonText="Cancel"
            submitButtonText="Submit"
            onClose={props.onClose}
            onSubmit={props.onSubmit}
            submitButtonVariant="primary"
            errors={props.errors}
        />
    )
}

const makeSummary = (calEvent, approvalState, dispatch) => {
    return (
        <div>
            <Form class="popup">


                <h4>Original Event</h4>
                <Table bordered>
                    <tbody>
                        <tr>
                            <td><strong>Engineer</strong></td>
                            <td>{`${calEvent.user.first_name} ${calEvent.user.last_name}`}</td>
                        </tr>
                        <tr>
                            <td><strong>Date</strong></td>
                            <td>{calEvent.date}</td>
                        </tr>
                        <tr>
                            <td><strong>Calibrator Instruments</strong></td>

                            <td>
                                <div className="detail-view-categories">
                                    <p>Coming Soon</p>
                                    {/* {this.state.calEvent.calibrator_categories.map(el => el.name).join(', ')} */}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </Table>
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
                                    {calEvent.comment !== '' ? calEvent.comment : 'None Entered'}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </Form>
        </div>
    )
}

const makeApprovalSection = (calEvent, approvalState, dispatch) => {
    return (
        <>
            <hr />

            <Form className="popup">
                <h4>Approval</h4>
                <Form.Group>
                    <Row>


                        <Col md={7}>
                            <Form.Label className="">Engineer:</Form.Label>
                            <Form.Control readOnly="readonly" type="text" value={`${calEvent.user.first_name} ${calEvent.user.last_name}`} />
                        </Col>
                        <Col>
                            <Form.Label>Date:</Form.Label>
                            <Form.Control readOnly="readonly" type="text" value={calEvent.date} />
                        </Col>

                    </Row>
                </Form.Group>
                <Form.Label>Action:</Form.Label>
                <div>
                    <Form.Check label="Approve" type='radio' id={`inline-radio-1`} checked={approvalState.isApproved} onClick={() => dispatch({ type: 'is_approve', payload: true })}/>
                    <Form.Check label="Reject" type='radio' id={`inline-radio-2`} checked={approvalState.isApproved === false} onClick={() => dispatch({ type: 'is_approve', payload: false })}/>
                </div>
                <Form.Group>
                    <Form.Label>Comment:</Form.Label>
                    <Form.Control as="textarea" rows={3} onChange={(e) => dispatch({ type: 'comment', payload: e.target.value })} />
                    <Form.Text muted>
                        Max 2000 characters
                    </Form.Text>
                </Form.Group>
            </Form>
        </>
    );
}

function reducer(state, action) {
    switch (action.type) {
        case 'comment':
            return { ...state, comment: action.payload };
        case 'is_approve':
            return { ...state, isApproved: action.payload };
        case 'clear':
            return getEmptyState();
        default:
            throw new Error();
    }
}

const getEmptyState = () => {
    return (
        {
            comment: '',
            isApproved: null,
        }
    )
}


export default CalibrationPopup;