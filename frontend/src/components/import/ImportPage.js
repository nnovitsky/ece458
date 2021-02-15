import React, { Component } from 'react';
import './ImportPage.css';
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';
import ModelServices from "../../api/modelServices.js";
import InstrumentServices from "../../api/instrumentServices.js";
import ImportPagePopup from './ImportPagePopup';
import ModelTable from "./ImportModelTable.js";
import InstrumentTable from "./ImportInstrumentTable.js";


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
            pagination: {
                resultCount: '',
                numPages: '',
                resultsPerPage: 10,
                currentPageNum: 1,
            },
            showInstructionsPopup: {
                isShown: false,
            },
            showModelTable: false,
            showInstrumentTable: false,
        }
        this.onShowInstructionsClosed = this.onShowInstructionsClosed.bind(this);

    }

    render(
        modelTable = <ModelTable
                        data={this.state.tableData}
                        countStart={(this.state.pagination.resultsPerPage) * (this.state.pagination.currentPageNum - 1)}
                        onDetailRequested={this.onDetailViewRequested}
                        sortData={() => {}}/>, 
        instrumentTable = <InstrumentTable
                            data={this.state.tableData}
                            countStart={(this.state.pagination.resultsPerPage) * (this.state.pagination.currentPageNum - 1)}
                            onDetailRequested={this.onDetailViewRequested}
                            onCertificateRequested={this.onCertificateRequested}
                            sortData={() => {}}/>
    ) {
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
                                Records: <b>{this.state.records_count}</b>
                            </p>
                        </div>
                        <div className="text-center">
                        <button onClick={this.onShowInstructionsClicked}>How to Import</button>
                        </div>
                    </div>

                    <div className="container">
                    <div className="row">
                    <div className="col-2"></div>
                    <div className="col-9">
                            {this.state.showModelTable ? modelTable : null}
                            {this.state.showInstrumentTable ? instrumentTable : null} 
                    </div>                       
                    </div>
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
            showModelTable: false,
            showInstrumentTable: false,
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
                        console.log(res);
                        this.setState({
                            status_message: "Success",
                            records_count: res.data.description,
                            tableData: res.data.upload_list,
                            showModelTable: true,
                            showInstrumentTable: false,
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
                        console.log(res);
                        console.log(res.data.upload_list);
                        this.setState({
                            status_message: "Success",
                            records_count: res.data.description,
                            tableData: res.data.upload_list,
                            showModelTable: false,
                            showInstrumentTable: true,
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