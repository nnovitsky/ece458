import React from 'react';
import Form from 'react-bootstrap/Form';

import GenericPopup from '../generic/GenericPopup';

//props
//'isShown' a boolean if the popup is visible
//'onSubmit' a handler that will be passed the new user information
//'onClose' a handler for when the popup is closed NOTE: called after a function in this file
//'errors' an array of formatted errors to display

let newUser = {
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    pk: null
}

const username = "username";
const password = "password";
const first_name = "first_name";
const last_name = "last_name";

const editUserPopup = (props) => {
    let body = makeBody();
    return (
        <GenericPopup
            show={props.isShown}
            body={body}
            headerText="Edit User"
            closeButtonText="Cancel"
            submitButtonText="Apply"
            onClose={props.onClose}
            onSubmit={(e) => onSubmit(e, props.onSubmit)}
            submitButtonVariant="primary"
            errors={props.errors}
        />
    )
}

const makeBody = () => {
    return (
        <Form className="popup">
            <Form.Label>Username</Form.Label>
            <Form.Control required type="text" name={username} onChange={onTextInput} placeholder="Enter Username" />

            <Form.Label>Password</Form.Label>
            <Form.Control required type="text" name={password} onChange={onTextInput} placeholder="Enter Password" />

            <Form.Label>First Name</Form.Label>
            <Form.Control required type="text" name={first_name} onChange={onTextInput} placeholder="Enter Your First Name" />

            <Form.Label>Last Name</Form.Label>
            <Form.Control required type="text" name={last_name} onChange={onTextInput} placeholder="Enter Your Last Name" />
        </Form>
    )
}

const onTextInput = (e) => {
    let val = e.target.value;
    switch (e.target.name) {
        case username:
            newUser.username = val
            return;
        case password:
            newUser.password = val;
            return;
        case first_name:
            newUser.first_name = val;
            return;
        case last_name:
            newUser.last_name = val;
            return
        default:
            return;
    }
}

const onSubmit = (e, parentHandler) => {
    if (isValid) {
        parentHandler(newUser);
    }
}

const isValid = () => {
    return true;
}

export default editUserPopup;
