import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import ModelServices from "../../api/modelServices";
import ModelFilterBar from "./ModelFilterBar";
import ModelTable from "./ModelTable";
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
            }
        }

        //binding
        this.onDetailClicked = this.onDetailClicked.bind(this);
        this.onFilteredSearch = this.onFilteredSearch.bind(this);
    }

    componentDidMount() {
        let data = modelServices.getModels()
        this.setState({
            tableData: data
        })
    }

    render() {
        console.log(this.state.filters)
        if (this.state.redirect !== null) {
            return (<Redirect to={this.state.redirect} />)
        }
    return (
        <div className="background">
        <div className="row mainContent">
            <div className="col-2 text-center">
                <img src={logo} alt="Logo" />
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
}

export default ModelTablePage;