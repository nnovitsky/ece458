import React from 'react';
import EditModelPopup from './AddModelPopup';
import DeletePopup from '../generic/GenericPopup';
import FormPopup from './FormPopup.js';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { Redirect } from "react-router-dom";
import { withRouter } from 'react-router';
import '../generic/General.css';

import ModelServices from "../../api/modelServices";
import InstrumentServices from '../../api/instrumentServices';
import { CalibrationModeDisplayMap, rawErrorsToDisplayed, hasModelEditAccess } from '../generic/Util';
import ErrorFile from '../../api/ErrorMapping/ModelErrors.json';
import SerialTable from './SerialTable';
import DetailView from '../generic/DetailView';

const modelServices = new ModelServices();
const instrumentServices = new InstrumentServices();


class ModelDetailView extends React.Component {
    constructor(props) {
        super(props);
        const arr = props.location.pathname.split('/')

        this.state = {
            isLoading: false,
            redirect: null,
            model_info: {
                pk: arr[arr.length - 1],
                vendor: '',
                model_number: '',
                description: '',
                comment: '',
                calibration_frequency: '',
                categories: [],
                calibration_modes: [],
                calibrator_categories_set: [],
                requires_approval: false,
            },
            instruments: [],
            editPopup: {
                isShown: false,
                errors: []
            },
            deletePopup: {
                isShown: false,
                errors: []
            },
            formPopup: {
                isShown: false,
                errors: []
            },
            pagination: {
                resultCount: 0,
                numPages: 1,
                resultsPerPage: 25,
                currentPageNum: 1,
                desiredPage: 1,
                showAll: false,
            },

        }

        this.onMoreClicked = this.onMoreClicked.bind(this);
        this.onEditClicked = this.onEditClicked.bind(this);
        this.onEditSubmit = this.onEditSubmit.bind(this);
        this.onEditClose = this.onEditClose.bind(this);
        this.onDeleteClicked = this.onDeleteClicked.bind(this);
        this.onDeleteSubmit = this.onDeleteSubmit.bind(this);
        this.onDeleteClose = this.onDeleteClose.bind(this);
        this.onFormClicked = this.onFormClicked.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.onFormClose = this.onFormClose.bind(this);

        this.onSerialTableChange = this.onSerialTableChange.bind(this);
    }

    async componentDidMount() {
        await this.updateModelInfo();
        await this.getInstruments();
    }

    render() {
        const isFormCalibrated = this.state.model_info.calibration_modes.includes("custom_form")
        const isModelAdmin = hasModelEditAccess(this.props.permissions);
        const headerButtons = <div>
            <Button onClick={this.onFormClicked} hidden={!isModelAdmin || !isFormCalibrated}>Edit Cal. Form</Button>
            <Button onClick={this.onEditClicked} hidden={!isModelAdmin}>Edit Model</Button>
            <Button onClick={this.onDeleteClicked} hidden={!isModelAdmin} variant="danger">Delete Model</Button>
        </div>

        let deletePopup = (this.state.deletePopup.isShown) ? this.makeDeletePopup() : null;
        let editPopup = (this.state.editPopup.isShown) ? this.makeEditPopup() : null;
        let formPopup = (this.state.formPopup.isShown) ? this.makeFormPopup() : null;

        if (this.state.redirect != null) {
            return <Redirect push to={this.state.redirect} />
        }

        let comment = (this.state.model_info.comment === '' ? 'No Comment Entered' : this.state.model_info.comment);
        return (
            <div>
                {deletePopup}
                {editPopup}
                {formPopup}
                <DetailView
                    title={`${this.state.model_info.vendor} ${this.state.model_info.model_number}`}
                    headerButtons={headerButtons}
                    col5={this.makeDetailsTable()}
                    comments={comment}
                    bottomElement={this.makeSerialTable()}
                    isLoading={this.state.isLoading}
                />
            </div>
        );
    }

    makeSerialTable() {
        return (
            <>
                <h3>Model's Instruments</h3>
                <SerialTable
                    data={this.state.instruments}
                    onTableChange={this.onSerialTableChange}
                    pagination={{ page: this.state.pagination.currentPageNum, sizePerPage: (this.state.pagination.showAll ? this.state.pagination.resultCount : this.state.pagination.resultsPerPage), totalSize: this.state.pagination.resultCount }}
                    onMoreClicked={this.onMoreClicked}
                />
            </>
        )
    }

    makeDeletePopup() {
        let body = (
            <p>Are you sure you want to delete Model: {this.state.model_info.model_number}?</p>
        )
        return (
            <DeletePopup
                show={this.state.deletePopup.isShown}
                body={body}
                headerText="Warning!"
                closeButtonText="Cancel"
                submitButtonText="Delete"
                onClose={this.onDeleteClose}
                onSubmit={this.onDeleteSubmit}
                submitButtonVariant="danger"
                errors={this.state.deletePopup.errors}
                isPrimaryOnLeft={true}
            />
        )
    }

    makeEditPopup() {
        return (
            <EditModelPopup
                isShown={this.state.editPopup.isShown}
                onSubmit={this.onEditSubmit}
                onClose={this.onEditClose}
                currentModel={this.state.model_info}
                errors={this.state.editPopup.errors}
            />
        )
    }

    makeFormPopup() {
        return (
            <FormPopup
                isShown={this.state.formPopup.isShown}
                onSubmit={this.onFormSubmit}
                onClose={this.onFormClose}
                currentModel={this.state.model_info}
                errors={this.state.formPopup.errors}
                model_pk={this.state.model_info.pk}
            />
        )
    }

    makeDetailsTable() {
        let modelInfo = this.state.model_info;
        const isCalibratable = this.state.model_info.calibration_frequency !== 0;
        return (
            <Table size="sm" bordered>
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
                        <td className="table-view-bold-td"><strong>Model Categories</strong></td>

                        <td>
                            <div className="detail-view-categories">
                                {modelInfo.categories.map(el => el.name).join(', ')}
                            </div>
                        </td>

                    </tr>
                    <tr>
                        <td><strong>Calibration Frequency</strong></td>
                        <td>{this.getCalFrequencyString()} </td>
                    </tr>
                    <tr hidden={!isCalibratable}>
                        <td><strong>Calibration Requires Validation</strong></td>
                        <td>{modelInfo.requires_approval ? 'Yes' : 'No'} </td>
                    </tr>
                    <tr hidden={!isCalibratable}>
                        <td><strong>Calibration Mode</strong></td>
                        <td>{this.getCalModesString()}</td>
                    </tr>
                    <tr hidden={!isCalibratable}>
                        <td className="table-view-bold-td"><strong>Calibrator Categories</strong></td>

                        <td>
                            <div className="detail-view-categories">
                                <p>Coming Soon</p>
                                {modelInfo.calibrator_categories_set.map(el => el.name).join(', ')}
                            </div>
                        </td>

                    </tr>
                </tbody>
            </Table>
        )
    }

    getCalFrequencyString() {
        let calFrequency = this.state.model_info.calibration_frequency;
        if (calFrequency > 1) {
            return `${calFrequency} days`;
        } else if (calFrequency === 1) {
            return `${calFrequency} day`;
        } else {
            return 'N/A'
        }
    }

    getCalModesString() {
        let result = this.state.model_info.calibration_modes.map(el => {
            return CalibrationModeDisplayMap[el]
        });
        if (result.length === 0) {
            result.push('Default');
        }
        return result.join(',');
    }

    onMoreClicked(e) {
        this.setState({
            redirect: `/instruments-detail/${e.target.value}`
        })
    }

    onEditClicked() {
        this.setState({
            editPopup: {
                ...this.state.editPopup,
                isShown: true
            }
        })
    }

    async onEditSubmit(editedModel) {
        await modelServices.editModel(editedModel.pk, editedModel.vendor, editedModel.model_number, editedModel.description, editedModel.comment, editedModel.calibration_frequency, editedModel.categories, editedModel.calibration_modes, editedModel.requires_approval).then(result => {
            if (result.success) {
                this.setState({
                    deletePopup: {
                        ...this.state.deletePopup,
                        isShown: false
                    }
                })

                this.updateModelInfo();
                this.onEditClose();
            } else {
                let formattedErrors = rawErrorsToDisplayed(result.errors, ErrorFile["add_edit_model"]);
                this.setState({
                    editPopup: {
                        ...this.state.editPopup,
                        errors: formattedErrors
                    }
                })
            }
        })

    }

    onEditClose() {
        this.setState({
            editPopup: {
                ...this.state.editPopup,
                isShown: false,
                errors: []
            }
        })
    }

    onFormClicked() {
        this.setState({
            formPopup: {
                ...this.state.formPopup,
                isShown: true,
            }
        })
    }

    onFormClose() {
        this.setState({
            formPopup: {
                ...this.state.formPopup,
                isShown: false,
                errors: []
            }
        })
    }

    onFormSubmit(){
        this.setState({
            formPopup: {
                ...this.state.formPopup,
                isShown: false,
                errors: []
            }
        })
    }

    onDeleteClicked() {
        this.setState({
            deletePopup: {
                ...this.state.deletePopup,
                isShown: true,
            }
        })
    }

    onDeleteClose() {
        this.setState({
            deletePopup: {
                ...this.state.deletePopup,
                errors: [],
                isShown: false,
            }
        })
    }

    async onDeleteSubmit() {
        await modelServices.deleteModel(this.state.model_info.pk).then(result => {
            if (result.success) {
                this.onDeleteClose();
                this.setState({
                    redirect: '/models/',
                    deletePopup: {
                        ...this.state.deletePopup,
                        isShown: false
                    }
                })
            } else {
                let formattedErrors = rawErrorsToDisplayed(result.errors, ErrorFile["delete_model"]);
                this.setState({
                    deletePopup: {
                        ...this.state.deletePopup,
                        errors: formattedErrors
                    }
                })
            }
        })
    }

    async onSerialTableChange(type, { page, sizePerPage }) {
        switch (type) {
            case 'pagination':
                if (sizePerPage === this.state.pagination.resultCount) {
                    this.setState({
                        pagination: {
                            ...this.state.pagination,
                            desiredPage: 1,
                            showAll: true,
                        }
                    }, () => {
                        this.getInstruments();
                    })
                } else {
                    this.setState({
                        pagination: {
                            ...this.state.pagination,
                            desiredPage: page,
                            showAll: false,
                            resultsPerPage: sizePerPage,
                        }
                    }, () => {
                        this.getInstruments();
                    })
                }
                return;
            default:
                return;
        }
    }


    async updateModelInfo() {
        await modelServices.getModel(this.state.model_info.pk).then((result) => {
            if (result.success) {
                this.setState({
                    model_info: {
                    ...result.data,
                    calibrator_categories_set: [],
                },
                })


            } else {
                console.log("error")
            }
        })
    }

    async getInstruments() {
        instrumentServices.getInstrumentsByModelPk(this.state.model_info.pk, this.state.pagination.desiredPage, this.state.pagination.showAll, this.state.pagination.resultsPerPage)
            .then(result => {
                if (result.success) {
                    this.setState({
                        instruments: result.data.data,
                        pagination: {
                            ...this.state.pagination,
                            resultCount: result.data.count,
                        }
                    })
                    if (!this.state.pagination.showAll) {
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
                    console.log("failed to get instrument instances");
                }
            })
    }

}
export default withRouter(ModelDetailView);