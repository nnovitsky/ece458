import React, { useEffect, useReducer } from 'react';
import GenericPopup from '../generic/GenericPopup';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "react-datepicker/dist/react-datepicker.css";
import Table from 'react-bootstrap/esm/Table';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import InstrumentServices from '../../api/instrumentServices';
import { Link } from 'react-router-dom';
//props
// 'calibrationEvent': calibration event from the cal event search
// 'currentUser': current user object
// 'isApprovalForm': boolean if the display should be an approval form (true) or a cal event summary (false)
//'isShown': boolean if popup is shown
//'onClose': event handler for the popup being closed
//'onSubmit': event handler for the calibration being submitted, will contain the fields below
//'errors': an array of errors to display

// onSupplementDownload: an event handler to call when wanting a download, event.target.value is the cal event pk
// onLoadBankClick: an event handler to call when wanting to see the load bank cal data, event.target.value is the cal event pk
// onKlufeClick: an event handler to call when wanting to see the guided hardware cal data, event.target.value is the cal event pk

const instrumentServices = new InstrumentServices();

const CalibrationPopup = (props) => {

    const [approvalState, dispatch] = useReducer(reducer, getEmptyState());

    useEffect(() => {
        dispatch({ type: 'is_approval_form', payload: props.isApprovalForm });
        if (props.isApprovalForm) {
            dispatch({ type: 'set_user', payload: props.currentUser });
            dispatch({ type: 'has_approval_section', payload: true });
        } else {
            async function fetchApprovalData() {
                await instrumentServices.getCalEventApproval(props.calibrationEvent.pk).then((result) => {
                    if (result.success) {
                        const approvalObject = {
                            comment: result.data.comment,
                            user: result.data.approver,
                            date: result.data.date,
                        }
                        dispatch({ type: 'set_approval', payload: approvalObject });
                    } else {
                        dispatch({ type: 'has_approval_section', payload: false });
                    }
                });
            }
            fetchApprovalData();
        }
    }, [props.calibrationEvent.pk, props.currentUser, props.isApprovalForm]);

    const body = (
        <>
            {makeSummary(props.calibrationEvent, props.onSupplementDownload, props.onLoadBankClick, props.onKlufeClick)}
            {approvalState.hasApprovalSection ? makeApprovalSection(props.calibrationEvent, approvalState, dispatch) : null}
            {props.calibrationEvent.approval_status === 'NA' ? makeApprovalNoInfoSection(props.calibrationEvent) : null}
        </>
    );
    const isApprovalForm = approvalState.isApprovalForm;
    return (
        <GenericPopup
            show={props.isShown}
            body={body}
            headerText={`Calibration Event - ${props.calibrationEvent.approval_status === 'NA' ? 'Approved' : props.calibrationEvent.approval_status}`}
            closeButtonText={isApprovalForm ? 'Cancel' : 'Close'}
            submitButtonText="Submit"
            onClose={() => onClose(dispatch, props.onClose)}
            onSubmit={() => onSubmit(approvalState, dispatch, props.onSubmit)}
            isSubmitButtonShown={isApprovalForm}
            submitButtonVariant="primary"
            errors={props.errors}
        />
    )
}

const makeSummary = (calEvent, onSupplementDownload, onLoadBankClick, onKlufeClick) => {
    const supplementData = getSupplementButton(calEvent, onSupplementDownload, onLoadBankClick, onKlufeClick)
    return (
        <div>
            <Form className="popup">


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
                            <td><strong>Supplement File</strong></td>
                            <td>{supplementData}</td>
                        </tr>
                        <tr>
                            <td><strong>Calibrator Instruments</strong></td>

                            <td>
                                <div className="detail-view-categories">
                                    {calEvent.calibrated_by_instruments.map((el, index) => {
                                        return ((<>
                                            <a href={`/instruments-detail/${el.instrument_pk}`} className="green-link">{`${el.instrument_name} (${el.asset_tag})`}</a>
                                            {index !== calEvent.calibrated_by_instruments.length - 1 ? ', ' : null}
                                        </>))
                                    })}
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
const getSupplementButton = (calEvent, onSupplementDownload, onLoadBankClick, onKlufeClick) => {
    switch (calEvent.file_type) {
        case 'None':
            return <span>N/A</span>;
        case 'Artifact':
            return <Button onClick={onSupplementDownload} value={calEvent.pk} className="data-table-button">Uploaded File</Button>
        case 'Load Bank':
            return <Button onClick={onLoadBankClick} value={calEvent.lb_cal_pk} className="data-table-button">Load Bank Data</Button>
        case 'Klufe':
            return <Button onClick={onKlufeClick} value={calEvent.klufe_cal_pk} className="data-table-button">Guided Hardware Data</Button>
        default:
            return <span>N/A</span>
    }
}

const makeApprovalNoInfoSection = (calEvent) => {
    const statusSpan = getSpanStatusColored('Approved');
    return (
        <>
            <hr />
            <Form className="popup">
                <h4 >Approval Event: {statusSpan}</h4>
            <span>This calibration was implicitly approved when the model was changed to require approval</span>
            </Form>
        </>
    );
}

const makeApprovalSection = (calEvent, approvalState, dispatch) => {
    const isApprovalForm = approvalState.isApprovalForm;
    const statusSpan = getSpanStatusColored(calEvent.approval_status);
    return (
        <>
            <hr />
            <Form className="popup">
                <h4 hidden={isApprovalForm}>Approval Event: {statusSpan}</h4>
                <Form.Group>
                    <Row>


                        <Col md={7}>
                            <Form.Label className="">Engineer:</Form.Label>
                            <Form.Control readOnly="readonly" type="text" value={`${approvalState.user.first_name} ${approvalState.user.last_name}`} />
                        </Col>
                        <Col>
                            <Form.Label>Date:</Form.Label>
                            <Form.Control readOnly="readonly" type="text" value={calEvent.date} />
                        </Col>

                    </Row>
                </Form.Group>
                <Form.Label hidden={!isApprovalForm}>Action:</Form.Label>
                <div hidden={!isApprovalForm}>
                    <Form.Check label="Approve" type='radio' id={`inline-radio-1`} checked={approvalState.isApproved ? true : false} onChange={() => dispatch({ type: 'is_approve', payload: true })} />
                    <Form.Check label="Reject" type='radio' id={`inline-radio-2`} checked={approvalState.isApproved === false ? true : false} onChange={() => dispatch({ type: 'is_approve', payload: false })} />
                </div>
                <Form.Group>
                    <Form.Label>Comment:</Form.Label>
                    <Form.Control as="textarea" readOnly={isApprovalForm ? '' : 'readonly'} rows={3} onChange={(e) => dispatch({ type: 'comment', payload: e.target.value })} value={approvalState.comment}/>
                    <Form.Text muted hidden={!isApprovalForm}>
                        Max 2000 characters
                    </Form.Text>
                </Form.Group>
            </Form>
        </>
    );
}

function getSpanStatusColored(approvalStatus) {
    let color;
    switch(approvalStatus) {
        case 'Rejected':
            color = 'red';
            break;
        case 'Approved':
            color = 'green';
            break;
        case 'Pending':
            color = 'blue';
            break;
        default:
            color = 'auto';
    };
    return <span style={{color: color}}>{approvalStatus}</span>
}

function onSubmit(approvalState, dispatch, parentSubmit) {
    parentSubmit(approvalState.comment, approvalState.isApproved);
    dispatch({ type: 'clear', payload: '' });
}

function onClose(dispatch, parentClose) {
    parentClose();
    dispatch({ type: 'clear', payload: '' });
}

function reducer(state, action) {
    switch (action.type) {
        case 'comment':
            return { ...state, comment: action.payload };
        case 'set_approval':
            const obj = action.payload;
            return { ...state, comment: obj.comment, user: obj.user, date: obj.date };
        case 'set_user':
            return { ...state, user: action.payload }
        case 'is_approve':
            return { ...state, isApproved: action.payload };
        case 'has_approval_section': 
            return { ...state, hasApprovalSection: action.payload };
        case 'is_approval_form':
            return { ...state, isApprovalForm: action.payload };
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
            isApprovalForm: false,
            hasApprovalSection: true,
            date: '',
            user: {
                first_name: '',
                last_name: '',
            },
        }
    )
}


export default CalibrationPopup;