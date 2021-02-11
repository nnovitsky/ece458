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
import { rawErrorsToDisplayed } from '../generic/Util';
import ErrorsFile from "../../api/ErrorMapping/ModelErrors.json";

const modelServices = new ModelServices();




class ModelTablePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: null,
            tableData: [],
            sortingIndicator: null,
            pagination: {
                next: '',
                previous: '',
                numPages: ''
            },
            filters: {
                model: '',
                vendor: '',
                description: ''
            },
            addModelPopup: {
                isShown: false,
                errors: []
            }

        }

        //binding
        this.onDetailClicked = this.onDetailClicked.bind(this);
        this.onFilteredSearch = this.onFilteredSearch.bind(this);
        this.onAddModelClosed = this.onAddModelClosed.bind(this);
        this.onAddModelSubmit = this.onAddModelSubmit.bind(this);
        this.updateModelTable = this.updateModelTable.bind(this);
        this.onPaginationClick = this.onPaginationClick.bind(this);
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
        return (
            <div>
                <AddModelPopup
                    isShown={this.state.addModelPopup.isShown}
                    onSubmit={this.onAddModelSubmit}
                    onClose={this.onAddModelClosed}
                    currentModel={null}
                    errors={this.state.addModelPopup.errors}
                />

                <div className="background">
                    <div className="row mainContent">
                        <div className="col-2 text-center button-col">
                            <img src={logo} alt="Logo" />
                            {this.props.is_admin ? adminButtons : null}
                            <Button onClick={this.onExportClicked}>Export</Button>
                        </div>
                        <div className="col-10">
                            <h1>Models</h1>
                            <ModelFilterBar
                                onSearch={this.onFilteredSearch}
                                onRemoveFilters={this.updateModelTable}
                            />
                            <h4>{this.state.sortingIndicator}</h4>
                            <ModelTable
                                data={this.state.tableData}
                                onDetailRequested={this.onDetailClicked}
                                sortData={this.onModelSort}
                            />
                            <Pagination
                                currentPageNum={1}
                                numPages={this.state.pagination.numPages}
                                onClick={this.onPaginationClick}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }



    onDetailClicked(e) {
        this.setState({
            redirect: `/models/${e.target.value}`
        })
    }

    async onFilteredSearch(newFilter) {
        // this.setState({
        //     ...this.state,
        //     filters: newFilter
        // }).then(
        await modelServices.modelFilterSearch(newFilter).then(
            (result) => {
                if (result.success) {
                    this.updateData(result.data);
                } else {
                    //TODO: 
                }
            }
        )

    }

    async onAddModelSubmit(newModel) {
        modelServices.addModel(newModel.vendor, newModel.model_number, newModel.description, newModel.comment, newModel.calibration_frequency)
            .then((res) => {
                if (res.success) {
                    this.updateModelTable();
                    this.onAddModelClosed();
                } else {
                    let formattedErrors = rawErrorsToDisplayed(res.errors, ErrorsFile['add_model']);
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

    onExportClicked = () => {
        console.log('Export clicked, handler needs to be implemented in ModelTablePage.js');
    }

    async updateModelTable() {
        modelServices.getModels().then((result) => {
            if (result.success) {
                console.log(result.data)
                this.updateData(result.data)
            } else {
                console.log("error loading model table data")
            }

        }
        )
    }

    async onPaginationClick(num) {
        await modelServices.getNewModelPage(this.state.pagination.next).then(result => {
            if (result.success) {
                this.updateData(result.data)
            }
        })
    }

    // method called with the data from a successful api hit for getting the model table,
    // sorting the data, filtering the data, or pagination
    updateData(data) {
        this.setState({
            pagination: {
                ...this.state.pagination,
                next: data.nextlink,
                previous: data.prevlink,
                numPages: data.numpages
            },
            tableData: data.data
        })
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
            case "Callibration (days)":
                sortingKey = "calibration_frequency"
                return sortingKey;
            default:
                this.setState({
                    sortingIndicator: null
                })
                return null;
        }
    }

    onModelSort = (sortingHeader) => {

        var urlSortingKey = this.getURLKey(sortingHeader);
        if(urlSortingKey === null) return;
        modelServices.getSortedModels(urlSortingKey)
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

export default ModelTablePage;

ModelTablePage.propTypes = {
    is_admin: PropTypes.bool.isRequired
}