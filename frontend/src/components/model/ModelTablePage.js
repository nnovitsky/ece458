import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import ModelServices from "../../api/modelServices";
import ModelFilterBar from "./ModelFilterBar";
import ModelTable from "./ModelTable";
import AddModelPopup from "./AddModelPopup";
import { Redirect } from "react-router-dom";
import PropTypes from 'prop-types';
import GenericLoader from '../generic/GenericLoader.js';


import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';
import { dateToString, nameAndDownloadFile, rawErrorsToDisplayed } from '../generic/Util';
import ErrorsFile from "../../api/ErrorMapping/ModelErrors.json";
import CategoryServices from '../../api/categoryServices';

const modelServices = new ModelServices();
const categoryServices = new CategoryServices();

class ModelTablePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: null,
            tableData: [],
            modelCategories: [],
            isLoading: false,
            pagination: {
                resultCount: 0,
                numPages: 1,
                resultsPerPage: 10,
                currentPageNum: 1,
            },
            modelSearchParams: {
                filters: {
                    model_number: '',
                    vendor: '',
                    description: '',
                    model_categories: []
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
        this.onCategoriesClicked = this.onCategoriesClicked.bind(this);
        this.onDetailClicked = this.onDetailClicked.bind(this);
        this.onFilteredSearch = this.onFilteredSearch.bind(this);
        this.onFilterChange = this.onFilterChange.bind(this);
        this.onRemoveFiltersClicked = this.onRemoveFiltersClicked.bind(this);
        this.onAddModelClosed = this.onAddModelClosed.bind(this);
        this.onAddModelSubmit = this.onAddModelSubmit.bind(this);
        this.updateModelTable = this.updateModelTable.bind(this);
        this.onExportModelsClicked = this.onExportModelsClicked.bind(this);
        this.onExportAllClicked = this.onExportAllClicked.bind(this);
        this.onTableChange = this.onTableChange.bind(this);
    }

    async componentDidMount() {
        this.setState({
            ...this.state,
            redirect: null
        }
        )
        this.updateModelTable();
        this.getModelCategories();
    }

    render() {
        console.log(this.state.modelCategories)
        if (this.state.redirect !== null) {
            return (<Redirect to={this.state.redirect} />)
        }
        let addModelPopup = (this.state.addModelPopup.isShown) ? this.makeAddModelPopup() : null;
        let buttonRow = (<div className="table-button-row">
            <Button onClick={this.onAddModelClicked} hidden={!this.props.is_admin}>Create</Button>
            <Button onClick={this.onExportModelsClicked}>Export</Button>
            <Button onClick={this.onCategoriesClicked} hidden={!this.props.is_admin}>Manage Categories</Button>

            {/* <Button onClick={this.onExportAllClicked}>Export Models and Instruments</Button> */}
        </div>)
        return (
            <div>
                <GenericLoader isShown={this.state.isLoading}></GenericLoader>
                {addModelPopup}
                <div className="background">
                    <div className="row mainContent">
                        <div className="col-2 text-center button-col">
                            <img src={logo} alt="Logo" />
                            <ModelFilterBar
                                onSearch={this.onFilteredSearch}
                                onRemoveFilters={this.onRemoveFiltersClicked}
                                onFilterChange={this.onFilterChange}
                                currentFilter={this.state.modelSearchParams.filters}
                                modelCategories={this.state.modelCategories}
                            />

                        </div>
                        <div className="col-10">
                            <h1>Models</h1>
                            
                            <ModelTable
                                data={this.state.tableData}
                                onTableChange={this.onTableChange}
                                pagination={{ page: this.state.pagination.currentPageNum, sizePerPage: (this.state.modelSearchParams.showAll ? this.state.pagination.resultCount : this.state.pagination.resultsPerPage), totalSize: this.state.pagination.resultCount }}
                                onMoreClicked={this.onDetailClicked}
                                inlineElements={buttonRow}
                            />
                            <hr />
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

    // event handler for the NewModelTable, it handles sorting and pagination
    onTableChange(type, { sortField, sortOrder, page, sizePerPage }) {
        switch (type) {
            case 'sort':
                let sortKey = this.getSortingKey(sortField, sortOrder);
                this.setState({
                    modelSearchParams: {
                        ...this.state.modelSearchParams,
                        sortingIndicator: sortKey,
                    }
                }, () => {
                    this.updateModelTable();
                });
                return;
            case 'pagination':
                if (sizePerPage === this.state.pagination.resultCount) {
                    this.setState({
                        modelSearchParams: {
                            ...this.state.modelSearchParams,
                            desiredPage: 1,
                            showAll: true,
                        }
                    }, () => {
                        this.updateModelTable();
                    })
                } else {
                    this.setState({
                        modelSearchParams: {
                            ...this.state.modelSearchParams,
                            desiredPage: page,
                            showAll: false,
                        }
                    }, () => {
                        this.updateModelTable();
                    });
                }
                return;
            default:
                console.log(`Model table does not support ${type}`);
        }
    }

    onCategoriesClicked() {
        this.setState({
            ...this.state,
            redirect: '/categories'
        });
    }

    onDetailClicked(e) {
        this.setState({
            ...this.state,
            redirect: `/models/${e.target.value}`
        })
    }

    onFilterChange(newFilter) {
        this.setState({
            modelSearchParams: {
                ...this.state.modelSearchParams,
                filters: newFilter,
            }
        })
    }

    async onFilteredSearch(newFilter) {
        this.setState({
            modelSearchParams: {
                ...this.state.modelSearchParams,
                filters: newFilter,
                desiredPage: 1
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
                    description: '',
                    model_categories: []
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
                        ...this.state,
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
        this.setState({
            isLoading: true,
        })

        let params = this.state.modelSearchParams;
        let modelCats = params.filters.model_categories.map(el => el.pk);

        let filters = {
            model_number: params.filters.model_number,
            vendor: params.filters.vendor,
            description: params.filters.description,
            model_categories: modelCats.join(","),
        }
        console.log(filters)
        modelServices.getModels(filters, params.sortingIndicator, params.showAll, params.desiredPage).then((result) => {
            this.setState({
                isLoading: false,
            })
            if (result.success) {
                this.updateData(result.data)

            } else {
                console.log("error loading model table data")
            }

        }
        )
    }

    async getModelCategories() {
        await categoryServices.getCategories('model', true, 1).then(
            (result) => {
                if (result.success) {
                    this.setState({
                        modelCategories: result.data.data
                    })
                }
            }
        )
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
                    currentPageNum: data.currentpage,
                },

            })
        } else {
            this.setState({
                pagination: {
                    ...this.state.pagination,
                    currentPageNum: 1
                },

            })
        }

    }

    getSortingKey = (sortingField, direction) => {
        let result;
        switch (sortingField) {
            case 'vendor':
                result = 'vendor_lower';
                break;
            case 'model_number':
                result = 'model_number_lower';
                break;
            case 'description':
                result = 'description_lower';
                break;
            case 'calibration_frequency':
                result = 'calibration_frequency_lower';
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

export default ModelTablePage;

ModelTablePage.propTypes = {
    is_admin: PropTypes.bool.isRequired
}