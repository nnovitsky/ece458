import React, { Component }  from 'react';
import Form from 'react-bootstrap/Form';

import GenericPopup from '../generic/GenericPopup';
import myInstructions from './ImportInstructions.js';
import './ImportPage.css';
import { nameAndDownloadFile } from '../generic/Util';
import ModelServices from "../../api/modelServices";
import InstrumentServices from "../../api/instrumentServices";
import Button from 'react-bootstrap/Button';


const modelServices = new ModelServices();
const instrumentServices = new InstrumentServices();

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
            submitButtonText="Download Model Example CSV"
            onClose={this.props.onClose}
            onSubmit={this.onModelCSVDOwnload}
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

    async onModelCSVDOwnload() {
        modelServices.exportSampleModelCSV().then(result => {
            if (result.success) {
                nameAndDownloadFile(result.url, `example-model-export`);
            }
        })
    }

    async onInstrumentCSVDownload() {
        instrumentServices.exportSampleInstrumentCSV().then(result => {
            if (result.success) {
                nameAndDownloadFile(result.url, `example-instrument-export`);
            }
        })
    }
}


export default ImportPagePopup;
