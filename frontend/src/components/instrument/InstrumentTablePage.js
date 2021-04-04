import React, { Component } from 'react';
import InstrumentServices from "../../api/instrumentServices";
import FilterBar from "./InstrumentFilterBar";
import InstrumentTable from "./InstrumentTable";

import AddInstrumentPopup from "./AddInstrumentPopup";
import logo from '../../assets/HPT_logo_crop.png';
import ErrorsFile from "../../api/ErrorMapping/InstrumentErrors.json";
import { dateToString, nameAndDownloadFile, rawErrorsToDisplayed, hasInstrumentEditAccess } from '../generic/Util';


import Button from 'react-bootstrap/Button';
import { Redirect } from "react-router-dom";
import PropTypes from 'prop-types';
import GenericLoader from '../generic/GenericLoader.js';

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
                resultsPerPage: 25,
                currentPageNum: 1
            },
            addInstrumentPopup: {
                isShown: false,
                errors: []
            },
            barcodes: {
                isSelecting: false,
                selected: [],
                numSelected: 0,
                instrumentPks: [],
                isSelectAll: false,
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
        this.onBarcodeButtonClick = this.onBarcodeButtonClick.bind(this);
        this.onBarcodeButtonCancelClick = this.onBarcodeButtonCancelClick.bind(this);
        this.onBarcodeButtonDownloadClick = this.onBarcodeButtonDownloadClick.bind(this);
        this.onInstrumentSelect = this.onInstrumentSelect.bind(this);
        this.onInstrumentSelectAll = this.onInstrumentSelectAll.bind(this);
        this.onFilterChange = this.onFilterChange.bind(this);
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
                perPage: 25,
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

    componentDidUpdate(prevProps, prevState) {
        const hasPageChange = this.state.pagination.currentPageNum !== prevState.pagination.currentPageNum;
        const hasShowAllChange = this.state.instrumentSearchParams.showAll !== prevState.instrumentSearchParams.showAll;
        const isSelectingAssets = this.state.barcodes.isSelecting;
        // a page change happened while selecting assets
        if ((hasPageChange || hasShowAllChange) && isSelectingAssets) {
            this.handlePaginationChangeForBarcodes();
        }
    }


    render() {
        //handle if it's time to redirect
        if (this.state.redirect !== null) {
            return (
                <Redirect push to={this.state.redirect} />
            )
        }

        const isInstrumentAdmin = hasInstrumentEditAccess(this.props.permissions);
        const defaultButtonRow = (
            <div className="table-button-row">
                <Button onClick={this.onAddInstrumentClicked} style={{ width: "75px", float: "left" }} hidden={!isInstrumentAdmin}>Create</Button>
                <Button onClick={this.onExportInstruments}>Export</Button>
                <Button onClick={this.onCategoriesClicked} hidden={!isInstrumentAdmin}>Manage Categories</Button>
                <Button onClick={this.onBarcodeButtonClick}>Download Barcodes</Button>
                {/* <Button onClick={this.onExportAll}>Export Instruments and Models</Button> */}
            </div>
        );
        const numSelected = this.state.barcodes.numSelected;
        const assetTagButtonRow = (
            <div className="table-button-row">
                <Button onClick={this.onBarcodeButtonCancelClick} variant="secondary">Cancel</Button>
                <Button onClick={this.onBarcodeButtonDownloadClick} variant="primary" disabled={numSelected === 0}>{`Download ${this.state.barcodes.numSelected} Barcode${numSelected === 1 ? `` : `s`}`}</Button>
            </div>
        )

        const displayedButtonRow = this.state.barcodes.isSelecting ? assetTagButtonRow : defaultButtonRow;
        let addInstrumentPopup = (this.state.addInstrumentPopup.isShown) ? this.makeAddInsrumentPopup() : null;
        const barcodeState = this.state.barcodes;
        const isSelectAllChecked = barcodeState.isSelectAll && (barcodeState.instrumentPks.length===0);
        return (
            <div>
                <GenericLoader isShown={this.state.isLoading}></GenericLoader>
                {addInstrumentPopup}
                <div className="background">
                    <div className="row mainContent">

                        <div className="col-2 text-center button-col">
                            <img src={logo} alt="Logo" />
                            <FilterBar
                                onSearch={this.onFilterChange}
                                onRemoveFilters={this.onFilterChange}
                                isWarning={barcodeState.isSelecting}
                            />
                        </div>
                        <div className="col-10">
                            <h1>{barcodeState.isSelecting ? 'Select Instruments for Barcode Download' : 'Instrument Table'}</h1>
                            <InstrumentTable
                                data={this.state.tableData}
                                onTableChange={this.onTableChange}
                                pagination={{ page: this.state.pagination.currentPageNum, sizePerPage: (this.state.instrumentSearchParams.showAll ? this.state.pagination.resultCount : this.state.pagination.resultsPerPage), totalSize: this.state.pagination.resultCount }}
                                onCertificateRequested={this.onCertificateRequested}
                                inlineElements={displayedButtonRow}
                                isSelecting={barcodeState.isSelecting}
                                handleSelect={this.onInstrumentSelect}
                                handleSelectAll={this.onInstrumentSelectAll}
                                selected={barcodeState.selected}
                                isSelectAllChecked={isSelectAllChecked}
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

    async onFilterChange() {
        if (this.state.barcodes.isSelecting) {
            this.setState({
                barcodes: {
                    ...this.state.barcodes,
                    selected: [],
                    numSelected: 0,
                    instrumentPks: [],
                    isSelectAll: false,
                }
            }, () => this.updateTable());
        } else {
            this.updateTable();
        }
    }

    async updateTable() {
        this.setState({
            isLoading: true,
        });

        this.updateSessionStorage();

        let instrumentSearchParams = window.sessionStorage.getItem("instrumentPageSearchParams");
        instrumentSearchParams = JSON.parse(instrumentSearchParams);
        const filters = this.getFilters();

        await instrumentServices.getInstruments(filters, instrumentSearchParams.sortingIndicator, instrumentSearchParams.showAll, instrumentSearchParams.desiredPage, instrumentSearchParams.perPage).then((result) => {
            if (result.success) {
                this.setState({
                    tableData: result.data.data,
                    pagination: {
                        ...this.state.pagination,
                        resultCount: result.data.count,
                    },
                    isLoading: false
                });
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
        let instrumentSearchParams = window.sessionStorage.getItem("instrumentPageSearchParams");
        instrumentSearchParams = JSON.parse(instrumentSearchParams);

        instrumentSearchParams.sortingIndicator = this.state.instrumentSearchParams.sortingIndicator;
        instrumentSearchParams.desiredPage = this.state.instrumentSearchParams.desiredPage;
        instrumentSearchParams.showAll = this.state.instrumentSearchParams.showAll;
        instrumentSearchParams.perPage = this.state.pagination.resultsPerPage;

        window.sessionStorage.setItem("instrumentPageSearchParams", JSON.stringify(instrumentSearchParams));
    }

    getFilters() {
        let instrumentSearchParams = window.sessionStorage.getItem("instrumentPageSearchParams");
        instrumentSearchParams = JSON.parse(instrumentSearchParams);

        let filters = instrumentSearchParams.filters;
        filters.instrument_categories = filters.instrument_categories.map(el => el.pk).join(',');
        filters.model_categories = filters.model_categories.map(el => el.pk).join(',');

        return filters;
    }

    onBarcodeButtonClick() {
        this.setState({
            barcodes: {
                ...this.state.barcodes,
                isSelecting: true,
                selected: [],
                numSelected: 0,
                instrumentPks: [],
            }
        });
    }

    onBarcodeButtonCancelClick() {
        this.setState({
            barcodes: {
                ...this.state.barcodes,
                isSelecting: false,
                selected: [],
                numSelected: 0,
                instrumentPks: [],
                isSelectAll: false,
            }
        });
    }

    async onBarcodeButtonDownloadClick() {
        console.log('tried to download barcodes, not integrated with backend');
        const filters = this.getFilters();
        let instrumentSearchParams = window.sessionStorage.getItem("instrumentPageSearchParams");
        instrumentSearchParams = JSON.parse(instrumentSearchParams);
        const sortingIndicator = this.state.instrumentSearchParams.sortingIndicator;
        const isSelectAll = this.state.barcodes.isSelectAll;
        this.setState({
            isLoading: true,
        }, async() => {
                await instrumentServices.getAssetBarcodes(this.state.barcodes.instrumentPks, filters, sortingIndicator, isSelectAll).then((result) => {
                    if (result.success) {
                        nameAndDownloadFile(result.url, `asset-barcodes`, result.type);
                        this.setState({
                            isLoading: false,
                        }, () => this.onBarcodeButtonCancelClick);
                    } else {
                        console.log('failed to download barcodes');
                        this.setState({
                            isLoading: false,
                        })
                    }
                })
        })
        
    }

    onInstrumentSelect(row, isSelect) {
        this.setState((prevState) => {
            // defining nice constants from the state to be used
            const isSelectAll = this.state.barcodes.isSelectAll;
            // determining what the instrument pks array should be
            let instrumentPksArr;
            if ((isSelect && !isSelectAll) || (!isSelect && isSelectAll)) {
                instrumentPksArr = [...this.state.barcodes.instrumentPks, row.pk];
            } else {
                instrumentPksArr = this.state.barcodes.instrumentPks.filter(x => x !== row.pk);
            }

            // determining what the number selected and the selected array should be
            let selectedArr;
            let numSelected;
            if (isSelect) {
                selectedArr = [...this.state.barcodes.selected, row.pk];
                numSelected = prevState.barcodes.numSelected + 1;
            } else {
                selectedArr = this.state.barcodes.selected.filter(x => x !== row.pk);
                numSelected = prevState.barcodes.numSelected - 1;
            }
            // updating the state according to the above
            return {
                barcodes: {
                    ...this.state.barcodes,
                    selected: selectedArr,
                    numSelected: numSelected,
                    instrumentPks: instrumentPksArr,
                }
            }
        });
    }

    async onInstrumentSelectAll(isSelect, rows) {
        this.setState({
            barcodes: {
                ...this.state.barcodes,
                instrumentPks: [],
            }
        }, async () => await this.selectAllDisplayed(isSelect, rows));
    }

    // will update the visual state for either select all/deselect all
    async selectAllDisplayed(isSelect, rows) {
        const ids = rows.map(r => r.pk);
        if (isSelect) {
            this.setState({
                isLoading: false,
                barcodes: {
                    ...this.state.barcodes,
                    selected: ids,
                    numSelected: (this.state.pagination.resultCount - this.state.barcodes.instrumentPks.length),
                    isSelectAll: isSelect,
                }
            });
        } else {
            this.setState({
                isLoading: false,
                barcodes: {
                    ...this.state.barcodes,
                    selected: [],
                    numSelected: (this.state.barcodes.instrumentPks.length),
                    isSelectAll: isSelect,
                }
            });
        }
    }

    async handlePaginationChangeForBarcodes() {
        // if select all, need to select all and remove any that are in the pks array
        if (this.state.barcodes.isSelectAll) {
            await this.selectAllDisplayed(true, this.state.tableData);
            this.setState({
                barcodes: {
                    ...this.state.barcodes,
                    selected: this.state.barcodes.selected.filter(x => !this.state.barcodes.instrumentPks.includes(x))
                }
            })
        }
        // if not select all, need to select any that are in the pks array
        else {
            this.setState({
                barcodes: {
                    ...this.state.barcodes,
                    selected: this.state.barcodes.instrumentPks,
                }
            })
        }
    }

    onCategoriesClicked() {
        this.setState({
            ...this.state,
            redirect: '/categories/instrument'
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
                        },
                        pagination: {
                            resultsPerPage: sizePerPage,
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

    onCertificateRequested(e) {
        instrumentServices.getCalibrationPDF(e.target.value)
            .then((result) => {
                console.log(result);
                if (result.success) {
                    let date = dateToString(new Date());
                    nameAndDownloadFile(result.url, `${date}-${e.target.id}-calibration-certificate`, result.type);
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
        this.setState({
            isLoading: true,
        });
        const filters = this.getFilters();
        instrumentServices.exportInstruments(filters, isAll).then(
            (result) => {
                if (result.success) {
                    let date = dateToString(new Date());
                    nameAndDownloadFile(result.url, `${date}-instrument-export`, result.type);
                }
                this.setState({
                    isLoading: false,
                })
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