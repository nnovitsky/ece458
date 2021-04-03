import React, { useState } from 'react';
import GenericPopup from '../generic/GenericPopup';
import Form from "react-bootstrap/Form";
//props
//'title': a string to be displayed as the header
//'isShown': boolean if popup is shown
//'onClose': event handler for the popup being closed
//'onSubmit': event handler for the calibration being submitted, will contain the fields below
//'errors': an array of errors to display
//'currentName': the initial name
//'submitText': the text to be displayed on the submit button

const RenamePopup = (props) => {
    const [newName, setNewName] = useState(props.currentName);

    return (
        <GenericPopup
            show={props.isShown}
            body={makeBody(newName, setNewName)}
            headerText={props.title}
            closeButtonText="Cancel"
            submitButtonText={props.submitText}
            onClose={props.onClose}
            onSubmit={() => props.onSubmit(newName)}
            submitButtonVariant="primary"
            errors={props.errors}
        />
    )
}

const makeBody = (newName, setName) => {
    return (
        <div>
            <Form className="popup">
                <Form.Group>
                    <Form.Label>Category Name</Form.Label>
                    <Form.Control value={newName} type="text" placeholder="Enter Category Name" onChange={(e) => onNameChange(e, setName)} />
                </Form.Group>
            </Form>
        </div>
    )
}

const onNameChange = (e, setNewName) => {
    setNewName(e.target.value);
}


export default RenamePopup;