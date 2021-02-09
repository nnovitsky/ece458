import React, { Component } from 'react';
import InstrumentServices from "../../api/instrumentServices";
import ModelServices from '../../api/modelServices';
import FilterBar from "./InstrumentFilterBar";
import InstrumentTable from "./InstrumentTable";

import AddInstrumentPopup from "./AddInstrumentPopup";
import logo from '../../assets/HPT_logo_crop.png';
import './instrument.css';

import Button from 'react-bootstrap/Button';
import { Redirect } from "react-router-dom";



const instrumentServices = new InstrumentServices();
const modelServices = new ModelServices();

class InstrumentTablePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: null,   //this will be a url if a redirect is necessary
            tableData: [],     //displayed data
            filters: {
                model: '',
                vendor: '',
                serial: '',
                description: ''
            },
            addInstrumentPopup: {
                isShown: false,
                vendorSelected: '',
                vendorsArr: [],
                modelsByVendor: []
            },
        }

        //need to bind any event callbacks
        this.updateTable = this.updateTable.bind(this);
        this.getVendorsArr = this.getVendorsArr.bind(this);
        this.getModelsByVendor = this.getModelsByVendor.bind(this);
        this.onDetailViewRequested = this.onDetailViewRequested.bind(this);
        this.onCertificateRequested = this.onCertificateRequested.bind(this);
        this.onFilteredSearch = this.onFilteredSearch.bind(this);
        this.onAddInstrumentClosed = this.onAddInstrumentClosed.bind(this);
        this.onAddInstrumentSubmit = this.onAddInstrumentSubmit.bind(this);

    }
    //make async calls here
    async componentDidMount() {
        await this.updateTable();
        await this.getVendorsArr();
    }

    render() {
        //handle if it's time to redirect
        if (this.state.redirect !== null) {
            return (
                <Redirect to={this.state.redirect} />
            )
        }

        return (
            <div>
                <AddInstrumentPopup
                    isShown={this.state.addInstrumentPopup.isShown}
                    onSubmit={this.onAddInstrumentSubmit}
                    onClose={this.onAddInstrumentClosed}
                    vendorsArr={this.state.addInstrumentPopup.vendorsArr}
                    getModelsByVendor={this.getModelsByVendor}
                    modelsArr={this.state.addInstrumentPopup.modelsByVendor}
                />
                <div className="background">
                    <div className="row mainContent">

                        <div className="col-2 text-center button-col">
                            <img src={logo} alt="Logo" />
                            <Button onClick={this.onAddInstrumentClicked}>Add Instrument</Button>
                            <Button onClick={this.onExportClicked}>Export</Button>
                        </div>
                        <div className="col-10">
                            <h1>Instrument Table</h1>
                            <FilterBar
                                onSearch={this.onFilteredSearch}
                                onRemoveFilters={this.updateTable}
                            />
                            <InstrumentTable
                                data={this.state.tableData}
                                onDetailRequested={this.onDetailViewRequested}
                                onCertificateRequested={this.onCertificateRequested}
                            />
                        </div>

                    </div>
                </div>
            </div>

        );
    }

    async updateTable() {
        instrumentServices.getInstruments().then((result) => {
            if (result.success) {
                this.setState({
                    tableData: result.data
                })
            } else {
                console.log("error")
            }
        })
    }

    async getVendorsArr() {
        modelServices.getVendors().then((result) => {
            if (result.success) {
                this.setState({
                    addInstrumentPopup: {
                        ...this.state.addInstrumentPopup,
                        vendorsArr: result.data.vendors
                    }
                })
            }
        })
    }

    async getModelsByVendor(vendor) {
        await modelServices.getModelByVendor(vendor).then((result) => {
            if (result.success) {
                this.setState({
                    addInstrumentPopup: {
                        ...this.state.addInstrumentPopup,
                        modelsByVendor: result.data
                    }
                })
                return;
            } else {
                return [];
            }
        })
    }

    onDetailViewRequested(e) {
        this.setState({
            redirect: `/instruments/${e.target.value}`
        });
    }

    onCertificateRequested(e) {
        console.log(`Certificate requested for instrument: ${e.target.value}`);
    }

    async onFilteredSearch(newFilter) {
        await instrumentServices.instrumentFilterSearch(newFilter).then(
            (result) => {
                if (result.success) {
                    this.setState({
                        tableData: result.data
                    })
                } else {
                    console.log("Error with filter search")
                }

            }
        )


    }

    onAddInstrumentClicked = (e) => {
        this.setState({
            addInstrumentPopup: {
                ...this.state.addInstrumentPopup,
                isShown: true
            }
        })
    }

    onExportClicked = (e) => {
        console.log('Export clicked, this handler still needs to be implemented in the InstrumentTablePage.js')
    }

    async onAddInstrumentSubmit(newInstrument) {
        await instrumentServices.addInstrument(newInstrument.model_pk, newInstrument.serial_number, newInstrument.comment);
        this.onAddInstrumentClosed();
        this.updateTable()
    }

    onAddInstrumentClosed() {
        this.setState({
            addInstrumentPopup: {
                ...this.state.addInstrumentPopup,
                isShown: false,
                vendorSelected: '',
                modelsByVendor: []
            }
        })
    }
}
export default InstrumentTablePage;