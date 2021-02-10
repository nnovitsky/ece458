import React, { useState } from 'react';
import GenericPopup from '../generic/GenericPopup';
import Form from "react-bootstrap/Form";
import DatePicker from 'react-datepicker';
import { dateToString } from '../generic/Util';
import "react-datepicker/dist/react-datepicker.css";
//props
//'isShown': boolean if popup is shown
//'onClose': event handler for the popup being closed
//'onSubmit': event handler for the calibration being submitted, will contain the fields below
//'errors': an array of errors to display

let newCalibration = {
    user: 'connect me!',
    date: dateToString(new Date()),
    comment: '',
}

const AddCalibrationPopup = (props) => {
    const [calDate, setCalDate] = useState(new Date());

    return (
        <GenericPopup
            show={props.isShown}
            body={makeBody(calDate, setCalDate)}
            headerText="Add Calibration"
            closeButtonText="Cancel"
            submitButtonText="Submit Calibration"
            onClose={props.onClose}
            onSubmit={() => props.onSubmit(newCalibration)}
            submitButtonVariant="primary"
            errors={props.errors}
        />
    )
}

const makeBody = (calDate, setCalDate) => {
    return (
        <div>
            <Form className="popup">
                <Form.Group>
                    <Form.Label>User</Form.Label>
                    <Form.Control type="text" value={newCalibration.user} readOnly />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Calibration Date</Form.Label>
                    <DatePicker onSelect={(e) => onDateChange(e, setCalDate)} selected={calDate} />
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

const onDateChange = (date, setCalDate) => {
    console.log(dateToString(date));
    newCalibration.date = dateToString(date)
    setCalDate(date);
}

export default AddCalibrationPopup;