import React, { Component } from 'react';
import './ImportPage.css';
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';
import ModelServices from "../../api/modelServices.js";
import InstrumentServices from "../../api/instrumentServices.js";
import ImportPagePopup from './ImportPagePopup';
import ModelTable from "../model/ModelTable.js";
import InstrumentTable from "../instrument/InstrumentTable.js";
import Button from 'react-bootstrap/Button';
import GenericLoader from '../generic/GenericLoader.js';


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
                resultCount: 0,
                numPages: 1,
                resultsPerPage: 10,
                currentPageNum: 1,
            },
            showInstructionsPopup: {
                isShown: false,
            },
            showModelTable: false,
            showInstrumentTable: false,
            isLoading: false,
        }
        this.onShowInstructionsClosed = this.onShowInstructionsClosed.bind(this);

    }

    render(
        modelTable =
            <div>
                <ModelTable
                    data={this.state.tableData}
                    onTableChange={null}
                    pagination={{ page: this.state.pagination.currentPageNum, sizePerPage: (this.state.pagination.resultsPerPage), totalSize: this.state.pagination.resultCount }}
                    onMoreClicked={null}
                    inlineElements={null}
                />
            </div>,


        instrumentTable = 
            <div>
                <InstrumentTable
                    data={this.state.tableData}
                    onTableChange={null}
                    pagination={{ page: this.state.pagination.currentPageNum, sizePerPage: (this.state.pagination.resultsPerPage), totalSize: this.state.pagination.resultCount }}
                    onCertificateRequested={this.onCertificateRequested}
                    onMoreClicked={null}
                    inlineElements={null}
                />
            </div>
    ) {
        return (
            <div>
                <ImportPagePopup
                    isShown={this.state.showInstructionsPopup.isShown}
                    onClose={this.onShowInstructionsClosed}
                />
                <GenericLoader isShown={this.state.isLoading}></GenericLoader>
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
                            <div className="popup-button-row lowerMargin">
                                <Button onClick={this.importModelClicked}>Import Model</Button>
                                <Button onClick={this.importInstrumentClicked}>Import Instrument</Button>
                            </div>
                            <div className="popup-button-row" >
                                <Button variant="secondary" style={{ width: "100%" }} onClick={this.onShowInstructionsClicked}>How to Import</Button>

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
                        </div>
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
        );
    }

    onUpload = (e) => {
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
                status_message: 'Uploding Model File...',
                isLoading: true
            })
            const formData = new FormData();
            formData.append('FILE', this.state.selectedFile);

            modelServices.importModelCSV(formData)
                .then(res => {
                    if (res.success) {
                        this.setState({
                            status_message: "Success",
                            records_count: res.data.description,
                            tableData: res.data.data,
                            showModelTable: true,
                            showInstrumentTable: false,
                            isLoading: false
                        })
                    }
                    else {
                        this.setState({
                            status_message: "Upload Errors",
                            records_count: res.errors["Upload error"][0],
                            isLoading: false
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
                status_message: 'Uploding Instrument File...',
                isLoading: true,
            })
            const formData = new FormData();
            formData.append('FILE', this.state.selectedFile);

            instrumentServices.importInstrumentCSV(formData)
                .then(res => {
                    if (res.success) {
                        this.setState({
                            status_message: "Success",
                            records_count: res.data.description,
                            tableData: res.data.data,
                            showModelTable: false,
                            showInstrumentTable: true,
                            isLoading: false,
                        })
                    }
                    else {
                        this.setState({
                            status_message: "Upload Errors",
                            records_count: res.errors["Upload error"][0],
                            isLoading: false,
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