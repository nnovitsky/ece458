import React, { Component }  from 'react';
import Form from 'react-bootstrap/Form';

import GenericPopup from '../generic/GenericPopup';
import myInstructions from './ImportInstructions.js';
import './ImportPage.css';
import { nameAndDownloadFile } from '../generic/Util';

//props
//'onClose' a handler for when the popup is closed NOTE: called after a function in this file
const importInstructions = myInstructions;

class  ImportPagePopup extends Component {
    constructor(props)
    {
        super(props);
    }
    render() { 
        let body = this.makeBody();
        return (
        <GenericPopup 
            show={this.props.isShown}
            body={body}
            headerText="How to Import"
            closeButtonText="Exit"
            submitButtonText="Download Example CSV"
            onClose={this.props.onClose}
            onSubmit={this.onCSVDOwnload}
            size="lg"
        />
    )
    }
    makeBody = () => {
        return (
            <Form className="popup">
                <div className="popupScrolling overflow-auto">
                    {importInstructions}
                </div>
            </Form>
        )
    }
    async onCSVDOwnload() {
        nameAndDownloadFile('https://people.sc.fsu.edu/~jburkardt/data/csv/addresses.csv', `example-csv`);
    }
}


export default ImportPagePopup;
