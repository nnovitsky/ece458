import React from 'react';
import Form from 'react-bootstrap/Form';

import GenericPopup from '../generic/GenericPopup';
import myInstructions from './ImportInstructions.js';

//props
//'onClose' a handler for when the popup is closed NOTE: called after a function in this file
const importInstructions = myInstructions;

const importPagePopup = (props) => {
    let body = makeBody();
    return (
        <GenericPopup
            show={props.isShown}
            body={body}
            headerText="How to Import"
            closeButtonText="Exit"
            onClose={props.onClose}
            isSubmitButtonShown={false}
        />
    )
}

const makeBody = () => {
    return (
        <Form className="popup">
            <p>
                {importInstructions}
            </p>
        </Form>
    )
}


export default importPagePopup;
