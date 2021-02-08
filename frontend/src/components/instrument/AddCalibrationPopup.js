import React from 'react';
import GenericPopup from '../generic/GenericPopup';
import Form from "react-bootstrap/Form";
import DatePicker from 'react-datepicker';
import { dateToString } from '../generic/Util';
import "react-datepicker/dist/react-datepicker.css";
//props
//'isShown': boolean if popup is shown
//'onClose': event handler for the popup being closed
//'onSubmit': event handler for the calibration being submitted, will contain the fields below

let newCalibration = {
    user: 'connect me!',
    date: dateToString(new Date()),
    comment: '',
}

const addCalibrationPopup = (props) => {
    return (
        <GenericPopup
            show={props.isShown}
            body={makeBody()}
            headerText="Add Calibration"
            closeButtonText="Cancel"
            submitButtonText="Submit Calibration"
            onClose={props.onClose}
            onSubmit={() => props.onSubmit(newCalibration)}
            submitButtonVariant="primary"
        />
    )
}

const makeBody = () => {
    return (
        <div>
            <Form className="popup">
                <Form.Group>
                    <Form.Label>User</Form.Label>
                    <Form.Control type="text" value={newCalibration.user} readOnly />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Calibration Date</Form.Label>
                    <DatePicker onSelect={onDateChange} selected={new Date(newCalibration.date)} />
                    <Form.Text muted>
                        Cannot be in the future
                    </Form.Text>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Comment</Form.Label>
                    <Form.Control as="textarea" rows={3} onChange={onCommentChange} />
                </Form.Group>
            </Form>
        </div>
    )
}

const onCommentChange = (e) => {
    newCalibration.comment = e.target.value;
}

const onDateChange = (date) => {
    console.log(dateToString(date));
}

export default addCalibrationPopup;