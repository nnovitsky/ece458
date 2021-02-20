import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import ModelServices from "../../api/modelServices";
import ModelFilterBar from "./ModelFilterBar";
import ModelTable from "./ModelTable";
import AddModelPopup from "./AddModelPopup";
import Pagination from '../generic/GenericPagination';
import { Redirect } from "react-router-dom";
import PropTypes from 'prop-types';

import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';
import { dateToString, nameAndDownloadFile, rawErrorsToDisplayed } from '../generic/Util';
import ErrorsFile from "../../api/ErrorMapping/ModelErrors.json";
import DataTable from '../generic/DataTable';

const modelServices = new ModelServices();

class ModelTablePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: null,
            tableData: [],
            pagination: {
                resultCount: '',
                numPages: '',
                resultsPerPage: 10,
                currentPageNum: 1,
            },
            modelSearchParams: {
                filters: {
                    model_number: '',
                    vendor: '',
                    description: ''
                },
                sortingIndicator: '',
                desiredPage: 1,
                showAll: false
            },
            addModelPopup: {
                isShown: false,
                errors: []
            },
            exportPopup: {
                isShown: false
            }

        }

        //binding
        this.onDetailClicked = this.onDetailClicked.bind(this);
        this.onFilteredSearch = this.onFilteredSearch.bind(this);
        this.onRemoveFiltersClicked = this.onRemoveFiltersClicked.bind(this);
        this.onAddModelClosed = this.onAddModelClosed.bind(this);
        this.onAddModelSubmit = this.onAddModelSubmit.bind(this);
        this.updateModelTable = this.updateModelTable.bind(this);
        this.onPaginationClick = this.onPaginationClick.bind(this);
        this.onToggleShowAll = this.onToggleShowAll.bind(this);
        this.onExportModelsClicked = this.onExportModelsClicked.bind(this);
        this.onExportAllClicked = this.onExportAllClicked.bind(this);
    }

    async componentDidMount() {
        this.setState({
            redirect: null
        }
        )
        this.updateModelTable();
    }

    render(
        adminButtons = <Button onClick={this.onAddModelClicked}>Add Model</Button>
    ) {
        if (this.state.redirect !== null) {
            return (<Redirect to={this.state.redirect} />)
        }
        let addModelPopup = (this.state.addModelPopup.isShown) ? this.makeAddModelPopup() : null;
        let tableConfig = this.makeTableConfig();
        return (
            <div>
                {addModelPopup}
                <div className="background">
                    <div className="row mainContent">
                        <div className="col-2 text-center button-col">
                            <img src={logo} alt="Logo" />
                            {this.props.is_admin ? adminButtons : null}
                            <Button onClick={this.onExportModelsClicked}>Export Models</Button>
                            <Button onClick={this.onExportAllClicked}>Export Models and Instruments</Button>
                        </div>
                        <div className="col-10">
                            <h1>Models</h1>
                            <ModelFilterBar
                                onSearch={this.onFilteredSearch}
                                onRemoveFilters={this.onRemoveFiltersClicked}
                            />
                            <p>Click on a table header to sort the data by that field, click again for descending order</p>
                            {/* <ModelTable
                                data={this.state.tableData}
                                countStart={(this.state.pagination.resultsPerPage) * (this.state.pagination.currentPageNum - 1)}
                                onDetailRequested={this.onDetailClicked}
                                sortData={this.onModelSort}
                            /> */}
                            <DataTable
                                config={tableConfig}
                                data={this.state.tableData}
                            />
                            <hr />
                            <Pagination
                                currentPageNum={this.state.pagination.currentPageNum}
                                numPages={this.state.pagination.numPages}
                                numResults={this.state.pagination.resultCount}
                                resultsPerPage={this.state.pagination.resultsPerPage}
                                onPageClicked={this.onPaginationClick}
                                onShowAllToggle={this.onToggleShowAll}
                                isShown={!this.state.modelSearchParams.showAll}
                                buttonText={(this.state.modelSearchParams.showAll) ? "Limit Results" : "Show All"}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    makeAddModelPopup() {
        return (
            <AddModelPopup
                isShown={this.state.addModelPopup.isShown}
                onSubmit={this.onAddModelSubmit}
                onClose={this.onAddModelClosed}
                currentModel={null}
                errors={this.state.addModelPopup.errors}
            />
        )
    }

    makeTableConfig() {
        return [
            {
                dataField: 'vendor',
                text: 'Vendor',
                sort: true,
            },
            {
                dataField: 'model_number',
                text: 'Model Number',
                sort: true,
            },
            {
                dataField: 'description',
                text: 'Description',
                sort: true,
            },
            {
                dataField: 'calibration_frequency',
                text: 'Calibration Frequency',
            },
            {
                text: 'More',
                dataField: 'pk',
                formatter: (pk) => {
                    return (
                        <a href={`/models/${pk}`}>More</a>
                    )
                }
            }
        ]
    }

    onDetailClicked(e) {
        this.setState({
            redirect: `/models/${e.target.value}`
        })
    }

    async onFilteredSearch(newFilter) {
        this.setState({
            modelSearchParams: {
                ...this.state.modelSearchParams,
                filters: newFilter
            }
        }, () => {
            this.updateModelTable();
        })
    }

    async onRemoveFiltersClicked() {
        this.setState({
            modelSearchParams: {
                ...this.state.modelSearchParams,
                filters: {
                    model_number: '',
                    vendor: '',
                    description: ''
                }
            }
        }, () => {
            this.updateModelTable();
        })
    }

    async onAddModelSubmit(newModel) {
        modelServices.addModel(newModel.vendor, newModel.model_number, newModel.description, newModel.comment, newModel.calibration_frequency)
            .then((res) => {
                if (res.success) {

                    this.updateModelTable();
                    this.onAddModelClosed();
                    this.setState({
                        redirect: `/models/${res.data.pk}`
                    })
                } else {
                    let formattedErrors = rawErrorsToDisplayed(res.errors, ErrorsFile['add_edit_model']);
                    this.setState({
                        addModelPopup: {
                            ...this.state.addModelPopup,
                            errors: formattedErrors
                        }
                    })
                }

            }
            );

    }

    onAddModelClosed() {
        this.setState({
            addModelPopup: {
                ...this.state.addModelPopup,
                isShown: false,
                errors: []
            }
        })
    }

    onAddModelClicked = () => {
        this.setState({
            addModelPopup: {
                ...this.state.addModelPopup,
                isShown: true
            }
        })
    }

    onExportModelsClicked = () => {
        this.exportModels(false);
    }

    onExportAllClicked = () => {
        this.exportModels(true);
    }

    async exportModels(isAll) {
        modelServices.exportModels(this.state.modelSearchParams.filters, isAll).then(result => {
            if (result.success) {
                let date = dateToString(new Date());
                nameAndDownloadFile(result.url, `${date}-model-export`);
            }
        })
    }

    async updateModelTable() {
        modelServices.getModels(this.state.modelSearchParams.filters, this.state.modelSearchParams.sortingIndicator, this.state.modelSearchParams.showAll, this.state.modelSearchParams.desiredPage).then((result) => {
            if (result.success) {
                this.updateData(result.data)
            } else {
                console.log("error loading model table data")
            }

        }
        )
    }

    async onPaginationClick(num) {
        this.setState({
            modelSearchParams: {
                ...this.state.modelSearchParams,
                desiredPage: num
            }
        }, () => {
            this.updateModelTable();
        })
    }

    async onToggleShowAll() {
        this.setState((prevState) => {
            return {
                modelSearchParams: {
                    ...this.state.modelSearchParams,
                    showAll: !prevState.modelSearchParams.showAll
                }
            }
        }, () => {
            this.updateModelTable();
        })
    }

    // method called with the data from a successful api hit for getting the model table,
    // sorting the data, filtering the data, or pagination
    updateData(data) {
        this.setState({
            tableData: data.data,
            pagination: {
                ...this.state.pagination,
                resultCount: data.count,
            }
        })

        if (!this.state.modelSearchParams.showAll) {
            this.setState({
                pagination: {
                    ...this.state.pagination,
                    resultCount: data.count,
                    numPages: data.numpages,
                    currentPageNum: data.currentpage
                },

            })
        }

    }

    getURLKey = (sortingHeader) => {

        let sortingKey = null
        this.setState({
            sortingIndicator: 'Sorted By: ' + sortingHeader
        })

        switch (sortingHeader) {
            case "Model Number":
                sortingKey = "model_number_lower"
                return sortingKey;
            case "Vendor":
                sortingKey = "vendor_lower"
                return sortingKey;
            case "Description":
                sortingKey = "description_lower"
                return sortingKey;
            case "Calibration (days)":
                sortingKey = "calibration_frequency"
                return sortingKey;
            default:
                this.setState({
                    sortingIndicator: ''
                })
                return '';
        }
    }

    onModelSort = (sortingHeader) => {
        var urlSortingKey = this.getURLKey(sortingHeader);
        //this handles ascending/descending, it toggles between
        if (this.state.modelSearchParams.sortingIndicator.includes(urlSortingKey)) {
            if (this.state.modelSearchParams.sortingIndicator.charAt(0) !== '-') {
                urlSortingKey = `-${urlSortingKey}`;
            }
        }
        if (urlSortingKey !== `-`) {
            this.setState({
                modelSearchParams: {
                    ...this.state.modelSearchParams,
                    sortingIndicator: urlSortingKey
                }
            }, () => {
                this.updateModelTable();
            })
        }

    }
}

export default ModelTablePage;

ModelTablePage.propTypes = {
    is_admin: PropTypes.bool.isRequired
}