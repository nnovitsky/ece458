import React from 'react';
import Form from 'react-bootstrap/Form';

import GenericPopup from '../generic/GenericPopup';

//props
//'isShown' a boolean if the popup is visible
//'onSubmit' a handler that will be passed the new user information
//'onClose' a handler for when the popup is closed NOTE: called after a function in this file
// 'errors' an array of formatted errors to display to the user

let newUser = {
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    pk: null
}

const username = "username";
const password = "password";
const first_name = "first_name";
const last_name = "last_name";
const email = "email";

const addUserPopup = (props) => {
    let body = makeBody();
    return (
        <GenericPopup
            show={props.isShown}
            body={body}
            headerText="Add User"
            closeButtonText="Cancel"
            submitButtonText="Create User"
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
            <Form.Label className="required-field">Username</Form.Label>
            <Form.Control required type="text" name={username} onChange={onTextInput} placeholder="Enter Username" />

            <Form.Label className="required-field">Password</Form.Label>
            <Form.Control required type="password" name={password} onChange={onTextInput} placeholder="Enter Password" />

            <Form.Label className="required-field">First Name</Form.Label>
            <Form.Control required type="text" name={first_name} onChange={onTextInput} placeholder="Enter Your First Name" />

            <Form.Label className="required-field">Last Name</Form.Label>
            <Form.Control required type="text" name={last_name} onChange={onTextInput} placeholder="Enter Your Last Name" />

            <Form.Label className="required-field">Email</Form.Label>
            <Form.Control required type="text" name={email} onChange={onTextInput} placeholder="Enter Your Email" />
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
        case email:
            newUser.email = val;
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

export default addUserPopup;
