import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';

import GenericPopup from '../generic/GenericPopup';
import myInstructions from './ImportInstructions.js';
import myInstrumentInstructions from './InstrumentImportInstructions.js';
import './ImportPage.css';
import { nameAndDownloadFile } from '../generic/Util';
import ModelServices from "../../api/modelServices";
import InstrumentServices from "../../api/instrumentServices";
import Button from 'react-bootstrap/Button';


const modelServices = new ModelServices();
const instrumentServices = new InstrumentServices();

//props
//'onClose' a handler for when the popup is closed NOTE: called after a function in this file
const AllImportInstructions = myInstructions;
const InstrumentImportInstructions = myInstrumentInstructions;

class ImportPagePopup extends Component {
    constructor(props) {
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
                onClose={this.props.onClose}
                isSubmitButtonShown={false}
                size="lg"
            />
        )
    }
    makeBody = () => {
        return (
            <Form className="popup">
                <div className="popup-button-row lowerMargin">
                    {this.props.hasModelPrivileges ? <Button onClick={this.onModelCSVDOwnload}>Download Sample Model CSV</Button> : null}
                    <Button onClick={this.onInstrumentCSVDownload}>Download Sample Instrument CSV</Button>
                </div>
                <div className="popupScrolling overflow-auto">
                    {this.props.hasModelPrivileges ? AllImportInstructions : InstrumentImportInstructions}
                </div>
            </Form>
        )
    }

    async onModelCSVDOwnload() {
        modelServices.exportSampleModelCSV().then(result => {
            if (result.success) {
                nameAndDownloadFile(result.url, `example-model-export`, result.type);
            }
        })
    }

    async onInstrumentCSVDownload() {
        instrumentServices.exportSampleInstrumentCSV().then(result => {
            if (result.success) {
                nameAndDownloadFile(result.url, `example-instrument-export`, result.type);
            }
        })
    }
}


export default ImportPagePopup;
