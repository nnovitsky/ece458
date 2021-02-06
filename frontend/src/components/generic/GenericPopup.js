import React from 'react';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

// This popup will make a generic dialog that will appear, it'll have a header, a body that is passed in as a prop,
// and then a row of buttons based on props passed in
// When passing in the body, it would likely be useful to keep track of the fields and a way to access them

// Props:
// 'show': true or false depending on if the modal is visible
// 'body': html to put into the body of the popup
// 'headerText': string of the text to be displayed in the header
// 'closeButtonText': text displayed for the popup to close
// 'submitButtonText': text displayed for the popup to submit
// 'onClose': handler for the close button being clicked
// 'onSubmit': handler for the submit button being clicked
// 'submitButtonVariant': a string that corresponds to a button variant, eg 'primary' or 'danger'

const genericPopup = (props) => {

    return (
        <Modal show={props.show}>
            <Modal.Header>
                <Modal.Title>{props.headerText}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {props.body}
            </Modal.Body>

            <Modal.Footer>
                {buttonArray(props.closeButtonText, props.submitButtonText, props.onClose, props.onSubmit, props.submitButtonVariant)}
            </Modal.Footer>
        </Modal>
    )
}

const buttonArray = (closeText, submitText, onClose, onSubmit, submitButtonVariant) => {
    let buttons = [];

    buttons.push(<Button variant="secondary" onClick={onClose}>{closeText}</Button>)
    buttons.push(<Button variant={submitButtonVariant} onClick={onSubmit}>{submitText}</Button>)


    return buttons;
}

export default genericPopup;