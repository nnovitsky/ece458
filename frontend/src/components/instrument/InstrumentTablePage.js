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
import GenericLoader from '../generic/GenericLoader.js';
import TableHoverTooltip from '../generic/TableHoverTooltip';


const instrumentServices = new InstrumentServices();

class InstrumentTablePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: null,   //this will be a url if a redirect is necessary
            tableData: [],     //displayed data
            instrumentSearchParams: {
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
            isLoading: false,
        }

        // the pagination and filters for this page use session storage
        this.initializeInstrumentSessionStorage();

        //need to bind any event callbacks
        this.updateTable = this.updateTable.bind(this);
        this.onCategoriesClicked = this.onCategoriesClicked.bind(this);
        this.onCertificateRequested = this.onCertificateRequested.bind(this);
        this.onAddInstrumentClosed = this.onAddInstrumentClosed.bind(this);
        this.onAddInstrumentSubmit = this.onAddInstrumentSubmit.bind(this);
        this.onExportAll = this.onExportAll.bind(this);
        this.onExportInstruments = this.onExportInstruments.bind(this);
        this.onTableChange = this.onTableChange.bind(this);


    }

    initializeInstrumentSessionStorage() {
        if (!window.sessionStorage.getItem("instrumentPageSearchParams")) {
            let instrumentPageSearchParams = {
                filters: {
                    model_number: '',
                    vendor: '',
                    serial_number: '',
                    description: '',
                    asset_tag: '',
                    model_categories: [],
                    instrument_categories: []
                },
                sortingIndicator: '',
                desiredPage: 1,
                showAll: false
            }
            window.sessionStorage.setItem("instrumentPageSearchParams", JSON.stringify(instrumentPageSearchParams));
        }
    }

    //make async calls here
    async componentDidMount() {
        let searchParams = window.sessionStorage.getItem("instrumentPageSearchParams");
        searchParams = JSON.parse(searchParams);

        this.setState({
            instrumentSearchParams: {
                ...this.state.instrumentSearchParams,
                sortingIndicator: searchParams.sortingIndicator,
                desiredPage: searchParams.desiredPage,
                showAll: searchParams.showAll
            }
        }, () => this.updateTable());
    }


    render() {
        //handle if it's time to redirect
        if (this.state.redirect !== null) {
            return (
                <Redirect push to={this.state.redirect} />
            )
        }
        let buttonRow = (
            <div className="table-button-row">
                <Button onClick={this.onAddInstrumentClicked} style={{ width: "75px", float: "left" }} hidden={!this.props.is_admin}>Create</Button>
                <Button onClick={this.onExportInstruments}>Export</Button>
                <Button onClick={this.onCategoriesClicked} hidden={!this.props.is_admin}>Manage Categories</Button>
                {/* <Button onClick={this.onExportAll}>Export Instruments and Models</Button> */}
            </div>
        )
        let addInstrumentPopup = (this.state.addInstrumentPopup.isShown) ? this.makeAddInsrumentPopup() : null;
        return (
            <div>
                <GenericLoader isShown={this.state.isLoading}></GenericLoader>
                {addInstrumentPopup}
                <div className="background">
                    <div className="row mainContent">

                        <div className="col-2 text-center button-col">
                            <img src={logo} alt="Logo" />
                            <FilterBar
                                onSearch={this.updateTable}
                                onRemoveFilters={this.updateTable}
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
        this.setState({
            isLoading: true,
        });

        this.updateSessionStorage();

        let instrumentSearchParams = window.sessionStorage.getItem("instrumentPageSearchParams");
        instrumentSearchParams = JSON.parse(instrumentSearchParams);

        let filters = instrumentSearchParams.filters;
        filters.instrument_categories = filters.instrument_categories.map(el => el.pk).join(',');
        filters.model_categories = filters.model_categories.map(el => el.pk).join(',');

        instrumentServices.getInstruments(filters, instrumentSearchParams.sortingIndicator, instrumentSearchParams.showAll, instrumentSearchParams.desiredPage).then((result) => {
            if (result.success) {
                this.setState({
                    tableData: result.data.data,
                    pagination: {
                        ...this.state.pagination,
                        resultCount: result.data.count,
                    },
                    isLoading: false
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
                } else {
                    this.setState({
                        pagination: {
                            ...this.state.pagination,
                            currentPageNum: 1
                        }
                    })
                }
                
            } else {
                this.setState({
                    isLoading: false,
                })
                console.log("error")
            }
        })
    }

    updateSessionStorage() {
        console.log("updating session storage");
        let instrumentSearchParams = window.sessionStorage.getItem("instrumentPageSearchParams");
        instrumentSearchParams = JSON.parse(instrumentSearchParams);

        instrumentSearchParams.sortingIndicator = this.state.instrumentSearchParams.sortingIndicator;
        instrumentSearchParams.desiredPage = this.state.instrumentSearchParams.desiredPage;
        instrumentSearchParams.showAll = this.state.instrumentSearchParams.showAll;

        window.sessionStorage.setItem("instrumentPageSearchParams", JSON.stringify(instrumentSearchParams));
    }

    onCategoriesClicked() {
        this.setState({
            ...this.state,
            redirect: '/categories'
        });
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


    // onDetailViewRequested(e) {
    //     this.setState({
    //         ...this.state,
    //         redirect: `/instruments-detail/${e.target.value}`
    //     });
    // }

    onCertificateRequested(e) {
        instrumentServices.getCalibrationPDF(e.target.value)
            .then((result) => {
                if (result.success) {
                    let date = dateToString(new Date());
                    nameAndDownloadFile(result.url, `${date}-${e.target.id}-calibration-certificate`);
                }
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
        let instrumentSearchParams = JSON.parse(window.sessionStorage.getItem("instrumentPageSearchParams"));
        let filters = instrumentSearchParams.filters;
        instrumentServices.exportInstruments(filters, isAll).then(
            (result) => {
                if (result.success) {
                    let date = dateToString(new Date());
                    nameAndDownloadFile(result.url, `${date}-instrument-export`);
                }
            }
        )
    }

    async onAddInstrumentSubmit(newInstrument) {
        await instrumentServices.addInstrument(newInstrument.model_pk, newInstrument.serial_number, newInstrument.comment, newInstrument.instrument_categories, newInstrument.asset_tag).then(
            (result) => {
                if (result.success) {
                    this.onAddInstrumentClosed();
                    this.updateTable();
                    this.setState({
                        ...this.state,
                        addInstrumentPopup: {
                            ...this.state.addInstrumentPopup,
                            errors: []
                        },
                        redirect: `/instruments-detail/${result.data.pk}`
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
            case 'asset_tag':
                result = 'asset_tag';
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