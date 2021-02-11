import React, { Component } from 'react';
import InstrumentServices from "../../api/instrumentServices";
import FilterBar from "./InstrumentFilterBar";
import InstrumentTable from "./InstrumentTable";

import AddInstrumentPopup from "./AddInstrumentPopup";
import logo from '../../assets/HPT_logo_crop.png';
import ErrorsFile from "../../api/ErrorMapping/InstrumentErrors.json";
import { rawErrorsToDisplayed } from '../generic/Util';

import Button from 'react-bootstrap/Button';
import { Redirect } from "react-router-dom";
import PropTypes from 'prop-types';



const instrumentServices = new InstrumentServices();

class InstrumentTablePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: null,   //this will be a url if a redirect is necessary
            sortingIndicator: null,
            tableData: [],     //displayed data
            filters: {
                model: '',
                vendor: '',
                serial: '',
                description: ''
            },
            addInstrumentPopup: {
                isShown: false,
                errors: []
            },
        }

        //need to bind any event callbacks
        this.updateTable = this.updateTable.bind(this);
        this.onDetailViewRequested = this.onDetailViewRequested.bind(this);
        this.onCertificateRequested = this.onCertificateRequested.bind(this);
        this.onFilteredSearch = this.onFilteredSearch.bind(this);
        this.onAddInstrumentClosed = this.onAddInstrumentClosed.bind(this);
        this.onAddInstrumentSubmit = this.onAddInstrumentSubmit.bind(this);

    }
    //make async calls here
    async componentDidMount() {
        await this.updateTable();
    }

    render(
        adminButtons = <Button onClick={this.onAddInstrumentClicked}>Add Instrument</Button>
    ) {
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
                    currentInstrument={null}
                    errors={this.state.addInstrumentPopup.errors}
                />
                <div className="background">
                    <div className="row mainContent">

                        <div className="col-2 text-center button-col">
                            <img src={logo} alt="Logo" />
                            {this.props.is_admin ? adminButtons : null}
                            <Button onClick={this.onExportClicked}>Export</Button>
                        </div>
                        <div className="col-10">
                            <h1>Instrument Table</h1>
                            <FilterBar
                                onSearch={this.onFilteredSearch}
                                onRemoveFilters={this.updateTable}
                            />
                            <h4>{this.state.sortingIndicator}</h4>
                            <InstrumentTable
                                data={this.state.tableData}
                                onDetailRequested={this.onDetailViewRequested}
                                onCertificateRequested={this.onCertificateRequested}
                                sortData={this.onInstrumentSort}
                            />
                        </div>

                    </div>
                </div>
            </div>

        );
    }

    async updateTable() {
        instrumentServices.getInstruments().then((result) => {
            console.log(result.data)
            if (result.success) {
                this.setState({
                    tableData: result.data
                })
            } else {
                console.log("error")
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
                    console.log("success")
                    console.log(result.data)
                    this.setState({
                        tableData: result.data.data
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
        await instrumentServices.addInstrument(newInstrument.model_pk, newInstrument.serial_number, newInstrument.comment).then(
            (result) => {
                if (result.success) {
                    console.log("Added!");
                    this.onAddInstrumentClosed();
                    this.updateTable();
                    this.setState({
                        addInstrumentPopup: {
                            ...this.state.addInstrumentPopup,
                            errors: []
                        }
                    })
                } else {
                    let formattedErrors = rawErrorsToDisplayed(result.errors, ErrorsFile['add_instrument']);
                    console.log(formattedErrors);
                    this.setState({
                        addInstrumentPopup: {
                            ...this.state.addInstrumentPopup,
                            errors: formattedErrors
                        }
                    })
                }
            }
        );

    }

    onAddInstrumentClosed() {
        this.setState({
            addInstrumentPopup: {
                ...this.state.addInstrumentPopup,
                isShown: false,
                errors: [],
            }
        })
    }
    
    getURLKey = (sortingHeader) => {
        let sortingKey = null
        this.setState({
            sortingIndicator: 'Sorted By: ' + sortingHeader
        })

        switch (sortingHeader) {
            case "Serial":
                sortingKey = "serial_number_lower"
                return sortingKey;
            case "Vendor":
                sortingKey = "vendor_lower"
                return sortingKey;
            case "Model":
                sortingKey = "model_number_lower"
                return sortingKey;
            case "Description":
                sortingKey = "description_lower"
                return sortingKey;
            case "Latest Callibration":
                    sortingKey = "-most_recent_calibration"
                    return sortingKey; 
            case "Callibration Expiration":
                sortingKey = "calibration_expiration_date"
                return sortingKey; 
            default:
                this.setState({
                    sortingIndicator: null
                })
                return null;
        }
    }

    onInstrumentSort = (sortingHeader) => {

        var urlSortingKey = this.getURLKey(sortingHeader);
        if(urlSortingKey === null) return;
        console.log(urlSortingKey);
        instrumentServices.getSortedInstruments(urlSortingKey)
        .then((res) => {
            if (res.success) {
                this.setState({
                    tableData: res.data
                })
            } else {
                console.log("error")
            }
        }
    ); 

    }
}
export default InstrumentTablePage;

InstrumentTablePage.propTypes = {
    is_admin: PropTypes.bool.isRequired
}