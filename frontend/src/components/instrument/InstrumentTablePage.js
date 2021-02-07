import React, { Component } from 'react';
import InstrumentServices from "../../api/instrumentServices";
import ModelServices from '../../api/modelServices';
import FilterBar from "./InstrumentFilterBar";
import InstrumentTable from "./InstrumentTable";

import AddPopup from "./AddPopup";
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
                isShown: false
            },
        }

        //need to bind any event callbacks
        this.onDetailViewRequested = this.onDetailViewRequested.bind(this);
        this.onCertificateRequested = this.onCertificateRequested.bind(this);
        this.onFilteredSearch = this.onFilteredSearch.bind(this);
        this.onAddInstrumentClosed = this.onAddInstrumentClosed.bind(this);
        this.onAddInstrumentSubmit = this.onAddInstrumentSubmit.bind(this);
        this.onGetModelSearchResults = this.onGetModelSearchResults.bind(this);
    }
    //make async calls here
    componentDidMount() {
        let data = instrumentServices.getInstruments();
        this.setState({
            tableData: data
        });
    }

    render() {
        console.log(this.state.filters)
        //handle if it's time to redirect
        if (this.state.redirect !== null) {
            return (
                <Redirect to={this.state.redirect} />
            )
        }

        return (
            <div>
                <AddPopup
                    isShown={this.state.addInstrumentPopup.isShown}
                    onSubmit={this.onAddInstrumentSubmit}
                    onClose={this.onAddInstrumentClosed}
                    getModelSearchResults={this.onGetModelSearchResults}
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

    onDetailViewRequested(e) {
        this.setState({
            redirect: `/instruments/${e.target.value}`
        });
    }

    onCertificateRequested(e) {
        console.log(`Certificate requested for instrument: ${e.target.value}`);
    }

    onFilteredSearch(newFilter) {
        this.setState({
            ...this.state,
            filters: newFilter
        })
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

    onAddInstrumentSubmit(newInstrument) {
        console.log(`New Instrument Added: ${newInstrument}`);
        this.onAddInstrumentClosed();
    }

    onAddInstrumentClosed() {
        this.setState({
            addInstrumentPopup: {
                ...this.state.addInstrumentPopup,
                isShown: false
            }
        })
    }

    onGetModelSearchResults(search) {
        return modelServices.getAllModelNumbers();
    }
}
export default InstrumentTablePage;