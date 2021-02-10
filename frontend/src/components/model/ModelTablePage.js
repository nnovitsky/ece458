import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import ModelServices from "../../api/modelServices";
import ModelFilterBar from "./ModelFilterBar";
import ModelTable from "./ModelTable";
import AddModelPopup from "./AddModelPopup";
import { Redirect } from "react-router-dom";
import PropTypes from 'prop-types';

import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';

const modelServices = new ModelServices();




class ModelTablePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: null,
            tableData: [],
            filters: {
                model: '',
                vendor: '',
                description: ''
            },
            addModelPopup: {
                isShown: false,
            }
        }

        //binding
        this.onDetailClicked = this.onDetailClicked.bind(this);
        this.onFilteredSearch = this.onFilteredSearch.bind(this);
        this.onAddModelClosed = this.onAddModelClosed.bind(this);
        this.onAddModelSubmit = this.onAddModelSubmit.bind(this);
        this.onGetVendorSearchResults = this.onGetVendorSearchResults.bind(this);
        this.updateModelTable = this.updateModelTable.bind(this);
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
                            <ModelTable
                                data={this.state.tableData}
                                onDetailRequested={this.onDetailClicked}
                                sortData={this.onModelSort}
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
                    this.setState({
                        tableData: result.data
                    })
                } else {
                    //TODO: 
                }
            }
        )

    }

    async onAddModelSubmit(newModel) {
        modelServices.addModel(newModel.vendor, newModel.model_number, newModel.description, newModel.comment, newModel.calibration_frequency)
            .then((res) => {
                this.updateModelTable();
                this.onAddModelClosed();
            }
        );

    }

    onAddModelClosed() {
        this.setState({
            addModelPopup: {
                ...this.state.addModelPopup,
                isShown: false
            }
        })
    }

    onGetVendorSearchResults(search) {
        return [];
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
                this.setState({
                    tableData: result.data
                })
            } else {
                console.log("error")
            }

        }
        )
    }

    getURLKey = (sortingHeader) => {
        let sortingKey = null

        switch (sortingHeader) {
            case "Model Number":
                sortingKey = "model_number"
                return sortingKey;
            case "Vendor":
                sortingKey = "vendor"
                return sortingKey;
            case "Description":
                sortingKey = "description"
                return sortingKey;
            case "Callibration (days)":
                sortingKey = "calibration_frequency"
                return sortingKey;
            default:
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
                console.log(res.data);
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