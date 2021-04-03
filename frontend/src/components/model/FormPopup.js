import React, { Component, useState } from 'react';
import Form from 'react-bootstrap/Form';
import GenericPopup from '../generic/GenericPopup';
import FormDnD from './FormDnD.js'
import './FormPopup.css'
import { useDrag, useDrop } from "react-dnd";

class FormPopup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isEdit: true,
            index: 1,
        }

        this.moveCard = this.moveCard.bind(this);
    }
    render() {
        let body = this.makeBody();
        let bodyText = (this.state.isEdit) ? "Edit Form" : "Create Form";
        let submitText = (this.state.isEdit) ? "Submit Changes" : "Create Form";

        return (
            <GenericPopup
                show={this.props.isShown}
                body={body}
                headerText={bodyText}
                closeButtonText="Cancel"
                submitButtonText={submitText}
                onClose={this.props.onClose}
                onSubmit={this.props.onSubmit}
                submitButtonVariant="primary"
                errors={this.props.errors}
                size={"xl"}
            />
        )
    }

    makeBody() {
        return (
            <FormDnD></FormDnD>
        )
    }

    moveCard(i){
        this.setState({
            index: i
        })
    }
}





export default FormPopup;