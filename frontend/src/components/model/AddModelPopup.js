import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';
import Select from 'react-select/creatable';
import ModelServices from '../../api/modelServices';

import GenericPopup from '../generic/GenericPopup';

//props
//'isShown' a boolean if the popup is visible
//'onSubmit' a handler that will be passed the new instrument information
//'onClose' a handler for when the popup is closed NOTE: called after a function in this file
//'currentModel' an object formatted exactly like newModel below, can also pass null if no pre-existing
//'errors' an optional field for an array of errors to be displayed

// let newModel = {
//     model_number: '',
//     vendor: '',
//     description: '',
//     comment: '',
//     calibration_frequency: '',
//     pk: null
// }

const modelName = "model";
const vendorName = "vendor";
const descriptionName = "description";
const commentName = "comment";
const callibrationName = "callibration";

const modelServices = new ModelServices();

class AddModelPopup extends Component {
    constructor(props) {
        super(props);

        //for whatever reason the select compne
        if (props.currentModel != null) {
            this.state = {
                isEdit: true,
                newModel: {
                    model_pk: props.currentModel.pk,
                    model_number: props.currentModel.model_number,
                    vendor: {
                        label: props.currentModel.vendor,
                        value: props.currentModel.vendor
                    },
                    description: props.currentModel.description,
                    comment: props.currentModel.comment,
                    calibration_frequency: props.currentModel.calibration_frequency,
                },
                vendorsArr: []
            }
        } else {
            this.state = {
                isEdit: false,
                newModel: {
                    model_pk: '',
                    model_number: '',
                    vendor: {
                        label: '',
                        value: ''
                    },
                    description: '',
                    comment: '',
                    calibration_frequency: '',

                },
                vendorsArr: [],
            }
        }

        this.onSubmit = this.onSubmit.bind(this);
        this.onTextInput = this.onTextInput.bind(this);
        this.onVendorInput = this.onVendorInput.bind(this);
    }

    async componentDidMount() {
        await this.getVendorsArr();
    }

    render() {
        let body = this.makeBody();
        let bodyText = (this.state.isEdit) ? "Edit Model" : "Create Model";
        let submitText = (this.state.isEdit) ? "Submit Changes" : "Create Model";
        return (
            <GenericPopup
                show={this.props.isShown}
                body={body}
                headerText={bodyText}
                closeButtonText="Cancel"
                submitButtonText={submitText}
                onClose={this.props.onClose}
                onSubmit={this.onSubmit}
                submitButtonVariant="primary"
                errors={this.props.errors}
            />
        )
    }

    makeBody() {
        return (
            <Form className="popup">
                <Form.Label>Model Number</Form.Label>
                <Form.Control required type="text" value={this.state.newModel.model_number} name={modelName} onChange={this.onTextInput} placeholder="Enter Model Number" />

                <Form.Label>Vendor</Form.Label>
                <Select
                    value={this.state.newModel.vendor}
                    options={this.state.vendorsArr}
                    isSearchable={true}
                    onChange={this.onVendorInput}
                    defaultInputValue={''}
                />
                <Form.Label>Description</Form.Label>
                <Form.Control required type="text" value={this.state.newModel.description} name={descriptionName} onChange={this.onTextInput} placeholder="Enter Description" />

                <Form.Label>Comments</Form.Label>
                <Form.Control as="textarea" rows={3} value={this.state.newModel.comment} name={commentName} onChange={this.onTextInput} />

                <Form.Label>Calibration Frequency (days)</Form.Label>
                <Form.Control required type="text" value={this.state.newModel.calibration_frequency} name={callibrationName} onChange={this.onTextInput} placeholder="Enter Calibration Frequency" />
                <Form.Text muted>If not calibratable, leave empty</Form.Text>
            </Form>
        )
    }

    async getVendorsArr() {
        modelServices.getVendors().then((result) => {
            if (result.success) {
                let formatted = result.data.vendors.map(opt => ({ label: opt, value: opt }));
                this.setState({
                    vendorsArr: formatted
                })
            } else {
                this.setState({
                    vendorsArr: []
                })
            }
        })
    }

    onVendorInput(e) {
        this.setState({
            newModel: {
                ...this.state.newModel,
                vendor: {
                    label: e.label,
                    value: e.value
                }
            }
        })
    }

    onTextInput(e) {
        let val = e.target.value;
        switch (e.target.name) {
            case modelName:
                this.setState({
                    newModel: {
                        ...this.state.newModel,
                        model_number: val
                    }
                })
                return;
            case vendorName:
                this.setState({
                    newModel: {
                        ...this.state.newModel,
                        vendor: {
                            value: val,
                            label: val
                        }
                    }
                })
                return;
            case descriptionName:
                this.setState({
                    newModel: {
                        ...this.state.newModel,
                        description: val
                    }
                })
                return;
            case commentName:
                this.setState({
                    newModel: {
                        ...this.state.newModel,
                        comment: val
                    }
                })
                return
            case callibrationName:
                this.setState({
                    newModel: {
                        ...this.state.newModel,
                        calibration_frequency: val
                    }
                })
                return;
            default:
                return;
        }
    }

    onSubmit() {
        if (this.isValid()) {
            let newModel = {
                pk: this.state.newModel.model_pk,
                model_number: this.state.newModel.model_number,
                vendor: this.state.newModel.vendor.label,
                calibration_frequency: this.state.newModel.calibration_frequency,
                comment: this.state.newModel.comment,
                description: this.state.newModel.description,
                pk: this.state.newModel.model_pk
            }

            if (newModel.calibration_frequency === '') {
                newModel.calibration_frequency = 0;
            }
            this.props.onSubmit(newModel);
        }
    }

    onClose() {
        this.setState = ({
            isEdit: false,
            newModel: {
                model_pk: '',
                model_number: '',
                vendor: {
                    label: '',
                    value: ''
                },
                description: '',
                comment: '',
                calibration_frequency: '',

            },
            vendorsArr: [],
        })
        this.props.onClose();
    }

    isValid = () => {
        return true;
    }
}

AddModelPopup.defaultProps = {
    errors: []
}

export default AddModelPopup;
