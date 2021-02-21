import React, { Component } from 'react';
import InstrumentServices from "../../api/instrumentServices";
import CalStatusKey from './CalStatusKey';
import FilterBar from "./InstrumentFilterBar";
import InstrumentTable from "./InstrumentTable";
import GenericPagination from "../generic/GenericPagination";

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
                resultCount: '',
                numPages: '',
                resultsPerPage: 10,
                currentPageNum: ''
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
        this.onInstrumentSort = this.onInstrumentSort.bind(this);
        this.onPaginationClick = this.onPaginationClick.bind(this);
        this.onToggleShowAll = this.onToggleShowAll.bind(this);
        this.onExportAll = this.onExportAll.bind(this);
        this.onExportInstruments = this.onExportInstruments.bind(this);
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

        let addInstrumentPopup = (this.state.addInstrumentPopup.isShown) ? this.makeAddInsrumentPopup() : null;
        return (
            <div>
                {addInstrumentPopup}
                <div className="background">
                    <div className="row mainContent">

                        <div className="col-2 text-center button-col">
                            <img src={logo} alt="Logo" />
                            {this.props.is_admin ? adminButtons : null}
                            <Button onClick={this.onExportInstruments}>Export Instruments</Button>
                            <Button onClick={this.onExportAll}>Export Instruments and Models</Button>
                            <CalStatusKey />
                        </div>
                        <div className="col-10">
                            <h1>Instrument Table</h1>
                            <FilterBar
                                onSearch={this.onFilteredSearch}
                                onRemoveFilters={this.onRemoveFilters}
                            />
                            <p>Click on a table header to sort the data by that field, click again for descending order</p>
                            <InstrumentTable
                                data={this.state.tableData}
                                countStart={(this.state.pagination.resultsPerPage) * (this.state.pagination.currentPageNum - 1)}
                                onDetailRequested={this.onDetailViewRequested}
                                onCertificateRequested={this.onCertificateRequested}
                                sortData={this.onInstrumentSort}
                            />
                            <hr />
                            <GenericPagination
                                currentPageNum={this.state.pagination.currentPageNum}
                                numPages={this.state.pagination.numPages}
                                numResults={this.state.pagination.resultCount}
                                resultsPerPage={this.state.pagination.resultsPerPage}
                                onPageClicked={this.onPaginationClick}
                                onShowAllToggle={this.onToggleShowAll}
                                isShown={!this.state.instrumentSearchParams.showAll}
                                buttonText={(this.state.instrumentSearchParams.showAll) ? "Limit Results" : "Show All"}
                            />
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


    onDetailViewRequested(e) {
        this.setState({
            redirect: `/instruments/${e.target.value}`
        });
    }

    onCertificateRequested(e) {
        instrumentServices.getCalibrationPDF(e.target.value)
            .then(res => {
                if (res.success) {
                    window.open(res.url, '_blank')
                    URL.revokeObjectURL(res.url)
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

    async onPaginationClick(num) {
        this.setState({
            instrumentSearchParams: {
                ...this.state.instrumentSearchParams,
                desiredPage: num
            }
        }, () => {
                this.updateTable();
        })
    }

    async onToggleShowAll() {
        this.setState((prevState) => {
            return {
                instrumentSearchParams: {
                    ...this.state.instrumentSearchParams,
                    showAll: !prevState.instrumentSearchParams.showAll
                }
            }
        }, () => {
                this.updateTable();
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
            case "Latest Calibration":
                sortingKey = "most_recent_calibration"
                return sortingKey;
            case "Calibration Expiration":
                sortingKey = "calibration_expiration_date"
                return sortingKey;
            case "Status":
                sortingKey = "calibration_expiration_date"
                return sortingKey;
            default:
                this.setState({
                    sortingIndicator: ''
                })
                return '';
        }
    }

    onInstrumentSort = (sortingHeader) => {

        let urlSortingKey = this.getURLKey(sortingHeader);
        //this handles ascending/descending, it toggles between
        if (this.state.instrumentSearchParams.sortingIndicator.includes(urlSortingKey)) {
            if (this.state.instrumentSearchParams.sortingIndicator.charAt(0) !== '-') {
                urlSortingKey = `-${urlSortingKey}`;
            }
        }
        if (urlSortingKey !== `-`) {
            this.setState({
                instrumentSearchParams: {
                    ...this.state.instrumentSearchParams,
                    sortingIndicator: urlSortingKey
                }
            }, () => {
                this.updateTable();
            })
        }

    }
}
export default InstrumentTablePage;

InstrumentTablePage.propTypes = {
    is_admin: PropTypes.bool.isRequired
}