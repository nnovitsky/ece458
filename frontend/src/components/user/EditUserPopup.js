import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';

import GenericPopup from '../generic/GenericPopup';
import { useState } from 'react';

//props
//'isShown' a boolean if the popup is visible
//'onSubmit' a handler that will be passed the new user information
//'onClose' a handler for when the popup is closed NOTE: called after a function in this file
//'errors' an array of formatted errors to display


const username = "username";
const password = "password";
const password_confirm = "password_confirm";
const first_name = "first_name";
const last_name = "last_name";

class EditUserPopup extends Component {

    constructor(props) {
        super(props);

        this.state = {
            newUser: {
                password: '',
                password_confirm: '',
                first_name: '',
                last_name: '',
            }
        }

        this.onSubmit = this.onSubmit.bind(this);
        this.onTextInput = this.onTextInput.bind(this);
    }
    render() {
        let body = this.makeBody();
        return (
            <GenericPopup
                show={this.props.isShown}
                body={body}
                headerText="Edit User"
                closeButtonText="Cancel"
                submitButtonText="Apply"
                onClose={this.props.onClose}
                onSubmit={this.onSubmit}
                submitButtonVariant="primary"
                errors={this.props.errors}
            />
        );
    }
    makeBody() {
        return (
            <Form className="popup">
                <p>Please enter the fields you wish to edit. Any fields left blank will not be changed. To change your password, please enter both fields.</p>
                <Form.Label>New Password</Form.Label>
                <Form.Control type="password" name={password} onChange={this.onTextInput} placeholder="Password" />

                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control type="password" name={password_confirm} onChange={this.onTextInput} placeholder="Re-enter Password" />

                <Form.Label>First Name</Form.Label>
                <Form.Control type="text" name={first_name} onChange={this.onTextInput} placeholder="Enter Your First Name" />

                <Form.Label>Last Name</Form.Label>
                <Form.Control type="text" name={last_name} onChange={this.onTextInput} placeholder="Enter Your Last Name" />
            </Form>
        )
    }

    onTextInput(e) {
        let val = e.target.value;
        switch (e.target.name) {
            case password:
                this.setState({
                    newUser: {
                        ...this.state.newUser,
                        password: val,
                    }
                })
                return;
            case password_confirm:
                this.setState({
                    newUser: {
                        ...this.state.newUser,
                        password_confirm: val,
                    }
                })
                return;
            case first_name:
                this.setState({
                    newUser: {
                        ...this.state.newUser,
                        first_name: val,
                    }
                })
                return;
            case last_name:
                this.setState({
                    newUser: {
                        ...this.state.newUser,
                        last_name: val,
                    }
                })
                return
            default:
                return;
        }
    }

    onSubmit() {
        this.props.onSubmit(this.state.newUser);

    }
}

export default EditUserPopup;
