import React from 'react';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert'

// This popup will make a generic dialog that will appear, it'll have a header, a body that is passed in as a prop,
// and then a row of buttons based on props passed in
// When passing in the body, it would likely be useful to keep track of the fields and a way to access them

// Props:
// 'show': true or false depending on if the modal is visible
// 'body': html to put into the body of the popup
// 'headerText': string of the text to be displayed in the header
// 'closeButtonText': text displayed for the popup to close
// 'submitButtonText': optional text displayed for the popup to submit, this is optional if you decide to hide the submit button
// 'onClose': handler for the close button being clicked
// 'onSubmit': optional handler for the submit button being clicked, this is optional in case you choose to hide the submit button
// 'submitButtonVariant': a string that corresponds to a button variant, eg 'primary' or 'danger'
// 'errors': an array of strings that are warnings, note an empty array means no errors are displayed, this is an optional field
// 'isSubmitButtonShown' optional boolean for if the submit button should be shown
//  'isSecondaryButtonShown': optional boolean for if the secondary button should be shown
// 'isPrimaryButtonEnabled': optional boolean for if the primary button is enabled
// 'isPrimaryOnLeft': optional boolean to put the primary button on the left, defaults to false

const genericPopup = (props) => {
    return (
        <Modal className="popup" show={props.show} onHide={props.onClose} size={props.size} backdrop={props.backdrop} keyboard={props.keyboard}>
            <Modal.Header>
                <Modal.Title>{props.headerText}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {props.body}
            </Modal.Body>

            <Modal.Footer>
                <Alert className={"popup-alert"} variant={'danger'} show={props.errors.length > 0}>
                    {makeErrorsParagraphs(props.errors)}
                </Alert>
                {buttonArray(props.closeButtonText, props.submitButtonText, props.onClose, props.onSubmit, props.submitButtonVariant, props.isSubmitButtonShown, props.isSecondaryButtonShown, props.isPrimaryButtonEnabled, props.isPrimaryOnLeft)}

            </Modal.Footer>
        </Modal>
    )
}

const buttonArray = (closeText, submitText, onClose, onSubmit, submitButtonVariant, isSubmitButtonShown, isSecondaryButtonShown, isPrimaryButtonEnabled, isPrimaryOnLeft) => {
    let buttons = [];
    const primary = (<Button variant={submitButtonVariant} onClick={onSubmit} hidden={!isSubmitButtonShown} disabled={!isPrimaryButtonEnabled}>{submitText}</Button>);

    buttons.push(<Button variant="secondary" onClick={onClose} hidden={!isSecondaryButtonShown}>{closeText}</Button>)

    if (isPrimaryOnLeft) {
        buttons.unshift(primary);
    } else {
        buttons.push(primary);
    }

    let buttonDiv = (
        <div className="popup-button-row">
            {buttons}
        </div>
    )

    return buttonDiv;
}

const makeErrorsParagraphs = (errorsArr) => {
    let result = [];
    errorsArr.forEach(e => {
        result.push(<p>{e}</p>)
    })
    return result;
}

genericPopup.defaultProps = {
    errors: [],
    isSubmitButtonShown: true,
    isSecondaryButtonShown: true,
    isPrimaryButtonEnabled: true,
    onSubmit: () => { },
    submitButtonText: '',
    isPrimaryOnLeft: false,
    backdrop: '#fff',
    keyboard: true,
}

export default genericPopup;