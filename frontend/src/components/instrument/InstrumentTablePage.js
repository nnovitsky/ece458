import React, { Component } from 'react';
import InstrumentServices from "../../api/instrumentServices";
import FilterBar from "./InstrumentFilterBar";
import InstrumentTable from "./InstrumentTable";

import AddInstrumentPopup from "./AddInstrumentPopup";
import logo from '../../assets/HPT_logo_crop.png';
import ErrorsFile from "../../api/ErrorMapping/InstrumentErrors.json";
import { dateToString, nameAndDownloadFile, rawErrorsToDisplayed } from '../generic/Util';


import Button from 'react-bootstrap/Button';
import { Redirect } from "react-router-dom";
import PropTypes from 'prop-types';



const instrumentServices = new InstrumentServices();

class InstrumentTablePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: null,   //this will be a url if a redirect is necessary
            tableData: [],     //displayed data
            url: '',
            instrumentSearchParams: {
                filters: {
                    model_number: '',
                    vendor: '',
                    serial_number: '',
                    description: ''
                },
                sortingIndicator: '',
                desiredPage: 1,
                showAll: false
            },
            pagination: {
                resultCount: 0,
                numPages: 1,
                resultsPerPage: 10,
                currentPageNum: 1
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
        this.onRemoveFilters = this.onRemoveFilters.bind(this);
        this.onAddInstrumentClosed = this.onAddInstrumentClosed.bind(this);
        this.onAddInstrumentSubmit = this.onAddInstrumentSubmit.bind(this);
        this.onExportAll = this.onExportAll.bind(this);
        this.onExportInstruments = this.onExportInstruments.bind(this);
        this.onTableChange = this.onTableChange.bind(this);
    }
    //make async calls here
    async componentDidMount() {
        await this.updateTable();
    }

    render(
        adminButtons = <Button onClick={this.onAddInstrumentClicked} style={{width: "75px", float:"left"}}>Create</Button>
    ) {
        //handle if it's time to redirect
        if (this.state.redirect !== null) {
            return (
                <Redirect to={this.state.redirect} />
            )
        }
        let buttonRow = (
            <div className="table-button-row">
                {this.props.is_admin ? adminButtons : null}
                <Button onClick={this.onExportInstruments}>Export</Button>
                {/* <Button onClick={this.onExportAll}>Export Instruments and Models</Button> */}
            </div>
        )
        let addInstrumentPopup = (this.state.addInstrumentPopup.isShown) ? this.makeAddInsrumentPopup() : null;
        return (
            <div>
                {addInstrumentPopup}
                <div className="background">
                    <div className="row mainContent">

                        <div className="col-2 text-center button-col">
                            <img src={logo} alt="Logo" />
                            <FilterBar
                                onSearch={this.onFilteredSearch}
                                onRemoveFilters={this.onRemoveFilters}
                            />
                        </div>
                        <div className="col-10">
                            <h1>Instrument Table</h1>
                            
                            <InstrumentTable
                                data={this.state.tableData}
                                onTableChange={this.onTableChange}
                                pagination={{ page: this.state.pagination.currentPageNum, sizePerPage: (this.state.instrumentSearchParams.showAll ? this.state.pagination.resultCount : this.state.pagination.resultsPerPage), totalSize: this.state.pagination.resultCount }}
                                onCertificateRequested={this.onCertificateRequested}
                                onMoreClicked={this.onDetailViewRequested}
                                inlineElements={buttonRow}
                            />
                            <hr />
                        </div>

                    </div>
                </div>
            </div>

        );
    }

    makeAddInsrumentPopup() {
        return (
            <AddInstrumentPopup
                isShown={this.state.addInstrumentPopup.isShown}
                onSubmit={this.onAddInstrumentSubmit}
                onClose={this.onAddInstrumentClosed}
                currentInstrument={null}
                errors={this.state.addInstrumentPopup.errors}
            />
        )
    }

    async updateTable() {
        let params = this.state.instrumentSearchParams;
        instrumentServices.getInstruments(params.filters, params.sortingIndicator, params.showAll, params.desiredPage).then((result) => {
            if (result.success) {
                this.setState({
                    tableData: result.data.data,
                    pagination: {
                        ...this.state.pagination,
                        resultCount: result.data.count,
                    }
                })
                if (!this.state.instrumentSearchParams.showAll) {
                    this.setState({
                        pagination: {
                            ...this.state.pagination,
                            resultCount: result.data.count,
                            numPages: result.data.numpages,
                            currentPageNum: result.data.currentpage
                        }
                    })
                }
            } else {
                console.log("error")
            }
        })
    }

    // event handler for the NewModelTable, it handles sorting and pagination
    onTableChange(type, { sortField, sortOrder, page, sizePerPage }) {
        switch (type) {
            case 'sort':
                let sortKey = this.getSortingKey(sortField, sortOrder);
                this.setState({
                    instrumentSearchParams: {
                        ...this.state.instrumentSearchParams,
                        sortingIndicator: sortKey,
                    }
                }, () => {
                    this.updateTable();
                });
                return;
            case 'pagination':
                if (sizePerPage === this.state.pagination.resultCount) {
                    this.setState({
                        instrumentSearchParams: {
                            ...this.state.instrumentSearchParams,
                            desiredPage: 1,
                            showAll: true,
                        }
                    }, () => {
                        this.updateTable();
                    })
                } else {
                    this.setState({
                        instrumentSearchParams: {
                            ...this.state.instrumentSearchParams,
                            desiredPage: page,
                            showAll: false,
                        }
                    }, () => {
                        this.updateTable();
                    })
                }
                return;
            default:
                console.log(`Instrument page does not support ${type} table function`);
                return;
        }
    }


    onDetailViewRequested(e) {
        this.setState({
            redirect: `/instruments/${e.target.value}`
        });
    }

    onCertificateRequested(e) {
        instrumentServices.getCalibrationPDF(e.target.value)
            .then((result) => {
                if (result.success) {
                    let date = dateToString(new Date());
                    nameAndDownloadFile(result.url, `${date}-calibration-certificate`);
                }
            })
    }

    async onFilteredSearch(newFilter) {
        this.setState({
            instrumentSearchParams: {
                ...this.state.instrumentSearchParams,
                filters: newFilter,
                desiredPage: 1
            }
        }, () => {
            this.updateTable();
        })
    }

    async onRemoveFilters() {
        this.setState({
            instrumentSearchParams: {
                ...this.state.instrumentSearchParams,
                filters: {
                    model_number: '',
                    vendor: '',
                    serial_number: '',
                    description: ''
                }
            }
        }, () => {
            this.updateTable();
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

    onExportInstruments = () => {
        this.exportInstruments(false);
    }

    onExportAll = () => {
        this.exportInstruments(true);
    }

    async exportInstruments(isAll) {
        instrumentServices.exportInstruments(this.state.instrumentSearchParams.filters, isAll).then(
            (result) => {
                if (result.success) {
                    let date = dateToString(new Date());
                    nameAndDownloadFile(result.url, `${date}-instrument-export`);
                }
            }
        )
    }

    async onAddInstrumentSubmit(newInstrument) {
        await instrumentServices.addInstrument(newInstrument.model_pk, newInstrument.serial_number, newInstrument.comment).then(
            (result) => {
                if (result.success) {
                    this.onAddInstrumentClosed();
                    this.updateTable();
                    this.setState({
                        addInstrumentPopup: {
                            ...this.state.addInstrumentPopup,
                            errors: []
                        },
                        redirect: `/instruments/${result.data.pk}`
                    })
                } else {
                    let formattedErrors = rawErrorsToDisplayed(result.errors, ErrorsFile['add_edit_instrument']);
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

    getSortingKey = (sortingField, direction) => {
        console.log(sortingField, direction)
        let result;
        switch (sortingField) {
            case 'item_model.vendor':
                result = 'vendor_lower';
                break;
            case 'item_model.model_number':
                result = 'model_number_lower';
                break;
            case 'serial_number':
                result = 'serial_number_lower';
                break;
            case 'item_model.description':
                result = 'description_lower';
                break;
            case 'latest_calibration':
                result = 'most_recent_calibration';
                break;
            case 'calibration_expiration':
                result = 'calibration_expiration_date';
                break;
            default:
                return '';
        }
        switch (direction) {
            case 'asc':
                return result;
            case 'desc':
                return `-${result}`;
            default:
                return result;
        }
    }
}
export default InstrumentTablePage;

InstrumentTablePage.propTypes = {
    is_admin: PropTypes.bool.isRequired
}