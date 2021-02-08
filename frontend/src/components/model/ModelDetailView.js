import React, { Component } from 'react';
import EditModelPopup from './AddModelPopup';
import DeletePopup from '../generic/GenericPopup';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { Redirect } from "react-router-dom";
import { withRouter } from 'react-router';
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';

import ModelServices from "../../api/modelServices";
import InstrumentServices from '../../api/instrumentServices';

const modelServices = new ModelServices();
const instrumentServices = new InstrumentServices();
let instrumentData = [];
let history;


class ModelDetailView extends React.Component {
    constructor(props) {
        super(props);
        const arr = props.location.pathname.split('/')

        this.state = {
            redirect: null,
            model_info: {
                pk: arr[arr.length - 1],
                vendor: '',
                model_number: '',
                description: '',
                comment: '',
                calibration_frequency: '',
                instruments: []
            },
            isEditShown: false,
            isDeleteShown: false
        }

        this.onMoreClicked = this.onMoreClicked.bind(this);
        this.onEditClicked = this.onEditClicked.bind(this);
        this.onEditSubmit = this.onEditSubmit.bind(this);
        this.onEditClose = this.onEditClose.bind(this);
        this.onDeleteClicked = this.onDeleteClicked.bind(this);
        this.onDeleteSubmit = this.onDeleteSubmit.bind(this);
        this.onDeleteClose = this.onDeleteClose.bind(this);
        this.onVendorSearch = this.onVendorSearch.bind(this);
    }

    async componentDidMount() {
        await this.updateInfo();
    }

    render() {
        console.log(this.state.model_info);
        let deletePopup = this.makeDeletePopup();

        if (this.state.redirect != null) {
            return <Redirect to={this.state.redirect} />
        }
        return (
            <div>
                {deletePopup}
                <EditModelPopup
                    isShown={this.state.isEditShown}
                    onSubmit={this.onEditSubmit}
                    onClose={this.onEditClose}
                    getVendorSearchResults={this.onVendorSearch}
                    existingData={this.state.model_info}
                />
                

            <div className="background">
                <div className="row mainContent">
                        <div className="col-2 text-center button-col">
                        <img src={logo} alt="Logo" />
                            <Button onClick={this.onEditClicked}>Edit Model</Button>
                            <Button onClick={this.onDeleteClicked}>Delete Model</Button>
                    </div>
                    <div className="col-10">
                        <h2>{`Model: ${this.state.model_info.model_number}`}</h2>
                        <Row>
                            <Col>{this.makeDetailsTable()}</Col>
                            <Col xs={6}>
                                {this.makeInstrumentsTable()}
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
            </div >
        );
    }
    
    makeDeletePopup() {
        let body = (
            <p>Are you sure you want to delete Model: {this.state.model_info.model_number}?</p>
        )
        return (
            <DeletePopup
                show={this.state.isDeleteShown}
                body={body}
                headerText="Warning!"
                closeButtonText="Cancel"
                submitButtonText="Delete"
                onClose={this.onDeleteClose}
                onSubmit={this.onDeleteSubmit}
                submitButtonVariant="danger"
            />
        )
    }

    makeDetailsTable() {
        let modelInfo = this.state.model_info;
        return (
            <Table bordered hover>
                <tbody>
                    <tr>
                        <td><strong>Vendor</strong></td>
                        <td>{modelInfo.vendor}</td>
                    </tr>
                    <tr>
                        <td><strong>Model</strong></td>
                        <td>{modelInfo.model_number}</td>
                    </tr>
                    <tr>
                        <td><strong>Description</strong></td>
                        <td>{modelInfo.description}</td>
                    </tr>
                    <tr>
                        <td><strong>Comment</strong></td>
                        <td>{modelInfo.comment}</td>
                    </tr>
                    <tr>
                        <td><strong>Calibration Frequency</strong></td>
                        <td>{modelInfo.calibration_frequency}</td>
                    </tr>
                </tbody>
            </Table>
        )
    }

    makeInstrumentsTable() {
        let rows = [];
        let count = 1;
        this.state.model_info.instruments.forEach((element) => {
            let currentRow = [];
            currentRow.push(
                <td>{count}</td>
            )
            currentRow.push(
                <td>{element["serial_number"]}</td>
            )
            currentRow.push(
                <td><Button onClick={this.onMoreClicked} value={element["pk"]}>More</Button></td>
            )
            count++;
            rows.push(
                <tr>{currentRow}</tr>
            )
        });

        return (
            <Table bordered hover>
                <thead>
                    <tr>
                        <th colSpan="3" className="text-center">Instances by Serial Number</th>
                    </tr>
                    <tr>
                        <th>#</th>
                        <th>Serial Number</th>
                        <th>More</th>
                    </tr>

                </thead>
                <tbody>
                    {rows}
                </tbody>
            </Table>
        )

    }



    onMoreClicked(e) {
        this.setState({
            redirect: `/instruments/${e.target.value}`
        })
    }

    onEditClicked() {
        this.setState({
            isEditShown: true
        })
    }

    onEditSubmit(editedModel) {
        this.updateInfo();
        this.onEditClose();
    }

    onEditClose() {
        this.setState({
            isEditShown: false
        })
    }

    onDeleteClicked() {
        this.setState({
            isDeleteShown: true
        })
    }

    onDeleteClose() {
        this.setState({
            isDeleteShown: false
        })
    }

    async onDeleteSubmit() {
        console.log("Deleting model");
        await modelServices.deleteModel(this.state.model_info.pk).then(result => {
            if (result.success) {
                this.onDeleteClose()
                this.setState({
                    redirect: '/models/'
                })
            } else {
                console.log('failed to delete');
            }
        });

    }

    onVendorSearch(search) {
        return ([])
    }

    async updateInfo() {
        await modelServices.getModel(this.state.model_info.pk).then((result) => {
            if (result.success) {
                this.setState({
                    model_info: result.data
                })
            } else {
                console.log("error")
            }
        })
    }
}
export default withRouter(ModelDetailView);