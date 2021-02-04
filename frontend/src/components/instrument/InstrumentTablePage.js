import React, { Component } from 'react';
import InstrumentServices from "../../api/instrumentServices";
import FilterBar from "./InstrumentFilterBar";
import logo from '../../assets/HPT_logo_crop.png';
import './instrument.css';

import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

import { Redirect } from "react-router-dom";

const keys = ["vendor", "model number", "serial", "short description", "most recent callibration date"];
const headerTextArr = ["Vendor", "Model", "Serial", "Description", "Last Callibration", "Next Callibration", "More", "Callibration Certificate"];
const instrumentServices = new InstrumentServices();

class InstrumentTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: null,   //this will be a url if a redirect is necessary
            tableData: []
        }

        //need to bind any event callbacks
        this.onDetailClicked = this.onDetailClicked.bind(this);
    }
    //make async calls here
    componentDidMount() {
        let data = instrumentServices.getInstruments();
        this.setState({
            tableData: data
        })
    }

    render() {
        if (this.state.redirect !== null) {
            return (
                <Redirect to={this.state.redirect} />
            )
        }
        return (
            <div className="background">
                <div className="row mainContent">
                    <div className="col-2 text-center">
                        <img src={logo} alt="Logo" />
                    </div>
                    <div className="col-10">
                        <h1>Instrument Table</h1>
                        <FilterBar />
                        {this.makeTable()}
                    </div>
                </div>
            </div>
        );
    }


    makeTable() {
        let header = this.createHeader();
        let body = this.createBody();

        return (
            <Table striped bordered hover>
                <thead>
                    {header}
                </thead>
                {body}

            </Table>)
    }

    createHeader() {
        let header = [];
        header.push(
            <th>#</th>
        )
        headerTextArr.forEach(h => {
            header.push(
                <th>{h}</th>
            )
        })
        return (
            <tr>
                {header}
            </tr>
        )
    }

    createBody() {
        let rows = [];
        let count = 1;
        this.state.tableData.forEach(currentData => {
            let rowElements = []
            rowElements.push(
                <td>{count}</td>
            )
            count++;
            keys.forEach(k => {
                rowElements.push(
                    <td>{currentData[k]}</td>
                )
            })

            rowElements.push(
                <td>TBD</td>
            )
            rowElements.push(
                <td><Button value={currentData["instrument pk"]} onClick={this.onDetailClicked}>More</Button></td>
            )
            rowElements.push(
                <td><Button>Download</Button></td>
            )
            let currentRow = (
                <tr>
                    {rowElements}
                </tr>
            )
            rows.push(currentRow);
        })
        return (
            <tbody>
                {rows}
            </tbody>
        );
    }


    onDetailClicked(e) {
        //history.push(`/instruments/${e.target.value}`);
        this.setState({
            redirect: `/instruments/${e.target.value}`
        });
    }
}
export default InstrumentTable;