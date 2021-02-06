import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import ModelServices from "../../api/modelServices";
import ModelFilterBar from "./ModelFilterBar";
import ModelTable from "./ModelTable";
import AddModelPopup from "./AddModelPopup";
import { Redirect } from "react-router-dom";

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
    }

    async componentDidMount() {
        this.updateModelTable();

    }

    render() {
        if (this.state.redirect !== null) {
            return (<Redirect to={this.state.redirect} />)
        }
        return (
            <div>
                <AddModelPopup
                    isShown={this.state.addModelPopup.isShown}
                    onSubmit={this.onAddModelSubmit}
                    onClose={this.onAddModelClosed}
                    getVendorSearchResults={this.onGetVendorSearchResults}
                />

                <div className="background">
                    <div className="row mainContent">
                        <div className="col-2 text-center button-col">
                            <img src={logo} alt="Logo" />
                            <Button onClick={this.onAddModelClicked}>Add Model</Button>
                            <Button onClick={this.onExportClicked}>Export</Button>
                        </div>
                        <div className="col-10">
                            <h1>Models</h1>
                            <ModelFilterBar
                                onSearch={this.onFilteredSearch}
                            />
                            <ModelTable
                                data={this.state.tableData}
                                onDetailRequested={this.onDetailClicked}
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

    onFilteredSearch(newFilter) {
        this.setState({
            ...this.state,
            filters: newFilter
        })
    }

    async onAddModelSubmit(newModel) {
        console.log("New model added")
        console.log(newModel);
        modelServices.addModel(newModel.vendor, newModel.model, newModel.description, newModel.comment, newModel.calibration)
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
                    redirect: null,
                    tableData: result.data
                })
            } else {
                console.log("error")
            }

        }
        )
    }
}

export default ModelTablePage;