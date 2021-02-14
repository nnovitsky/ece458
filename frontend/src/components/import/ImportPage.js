import React, { Component } from 'react';
import './ImportPage.css';
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';
import GenericTable from '../generic/GenericTable';
import ModelServices from "../../api/modelServices.js";
import InstrumentServices from "../../api/instrumentServices.js";
import ImportPagePopup from './ImportPagePopup';


const keys = ["$.type", "$.model_number", "$.serial"];
const headers = ["Type", "Model Number", "Serial Number", "More"];
const buttonText = ["More"];
const modelServices = new ModelServices();
const instrumentServices = new InstrumentServices();


class ImportPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedFile: null,
            status_message: '',
            records_count: '',
            tableData: [],
            showInstructionsPopup: {
                isShown: false,
            },
        }
        this.onShowInstructionsClosed = this.onShowInstructionsClosed.bind(this);

    }

    render() {
        return (
            <div>
            <ImportPagePopup
                    isShown={this.state.showInstructionsPopup.isShown}
                    onClose={this.onShowInstructionsClosed}
                />

            <div className="background">
                <div className="row mainContent">
                    <div className="col-2 text-center"><img src={logo} alt="Logo" /></div>
                    <div className="col-5"><h2>Import</h2>
                        <form className="text-center" method="post" action="#" id="#">
                            <div className="form-group files">
                                <label>Upload Your File</label>
                                <input type="file" className="form-control" multiple="" onChange={this.onUpload}></input>
                            </div>
                        </form>
                        <div className="text-center">
                        <button className="import" onClick={this.importModelClicked}>Import Model</button>
                        <button className="import" onClick={this.importInstrumentClicked}>Import Instrument</button>
                        </div>
                    </div>
                    <div className="col-4 leftText">
                        <h2>Summary</h2>
                        <div className="summary overflow-auto">
                            <p>
                                Status: <b>{this.state.status_message}</b>
                                <br></br>
                                <br></br>
                                Records Count: <b>{this.state.records_count}</b>
                            </p>
                        </div>
                        <div className="text-center">
                        <button onClick={this.onShowInstructionsClicked}>How to Import</button>
                        </div>
                    </div>


                    <div className="row">
                        <div className="col-4"> </div>
                        <div className="col-5">
                            <GenericTable data={this.state.tableData} keys={keys} headers={headers} buttonText={buttonText} buttonFunctions={[this.onEntryClicked]} />                         
                        </div>
                        <div className="col-4"> </div>
                    </div>
                </div>
            </div>
            </div>
        );
    }

    onUpload = (e) => {
        console.log(e.target.files[0])
        this.setState({
            selectedFile: e.target.files[0],
            status_message: 'Selected File',
            records_count: '',
        })
    }

    onShowInstructionsClicked = () => {
        this.setState({
            showInstructionsPopup: {
                ...this.state.showInstructionsPopup,
                isShown: true
            }
        })
    }

    onShowInstructionsClosed() {
        this.setState({
            showInstructionsPopup: {
                ...this.state.showInstructionsPopup,
                isShown: false
            }
        })
    }

    importModelClicked = (e) => {
        if (this.state.selectedFile !== null && typeof (this.state.selectedFile) !== 'undefined') {
            this.setState({
                status_message: 'Uploding Model File...'
            })
            const formData = new FormData();
                formData.append('FILE', this.state.selectedFile);

            modelServices.importModelCSV(formData)
                .then(res => {
                    if (res.success) {
                        this.setState({
                            status_message: "Success",
                            records_count: res.data.description
                        })
                    }
                    else {
                        this.setState({
                            status_message: "Upload Errors",
                            records_count: res.errors["Upload error"][0]
                        })
                    }

                })
        }
        else {
            this.setState({
                status_message: "No file chosen"
            })
        }
    }


    importInstrumentClicked = (e) => {
        if (this.state.selectedFile !== null && typeof (this.state.selectedFile) !== 'undefined') {
            this.setState({
                status_message: 'Uploding Instrument File...'
            })
            const formData = new FormData();
                formData.append('FILE', this.state.selectedFile);

            instrumentServices.importInstrumentCSV(formData)
                .then(res => {
                    if (res.success) {
                        this.setState({
                            status_message: "Success",
                            records_count: res.data.description
                        })
                    }
                    else {
                        this.setState({
                            status_message: "Upload Errors",
                            records_count: res.errors["Upload error"][0]
                        })
                    }

                })
        }
        else {
            this.setState({
                status_message: "No file chosen"
            })
        }
    }
}

export default ImportPage;