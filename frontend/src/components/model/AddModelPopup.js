import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';
import Select from 'react-select/creatable';
import ModelServices from '../../api/modelServices';

import GenericPopup from '../generic/GenericPopup';

//props
//'isShown' a boolean if the popup is visible
//'onSubmit' a handler that will be passed the new instrument information
//'onClose' a handler for when the popup is closed NOTE: called after a function in this file
//'currenModel' an object formatted exactly like newModel below, can also pass null if no pre-existing

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
        if (props.currentModel !== null) {
            console.log("not null")
            this.state = {
                isEdit: true,
                newModel: {
                    model_pk: props.currentModel.model_pk,
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
            console.log('null')
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
        return (
            <GenericPopup
                show={this.props.isShown}
                body={body}
                headerText="Add Model"
                closeButtonText="Cancel"
                submitButtonText="Create Model"
                onClose={this.props.onClose}
                onSubmit={(e) => this.onSubmit(e, this.props.onSubmit)}
                submitButtonVariant="primary"
            />
        )
    }

    makeBody() {
        return (
            <Form className="popup">
                <Form.Label>Model Number</Form.Label>
                <Form.Control required type="text" name={modelName} onChange={this.onTextInput} placeholder="Enter Model Number" />

                <Form.Label>Vendor</Form.Label>
                <Select
                    value={this.state.newModel.vendor}
                    options={this.state.vendorsArr}
                    isSearchable={true}
                    onChange={this.onVendorInput}
                    defaultInputValue={''}
                />
                <Form.Label>Description</Form.Label>
                <Form.Control required type="text" name={descriptionName} onChange={this.onTextInput} placeholder="Enter Description" />

                <Form.Label>Comments</Form.Label>
                <Form.Control as="textarea" rows={3} name={commentName} onChange={this.onTextInput} />

                <Form.Label>Callibration Frequency (days)</Form.Label>
                <Form.Control required type="text" name={callibrationName} onChange={this.onTextInput} placeholder="Enter Callibration Frequency" />
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

    onSubmit = (e) => {
        if (this.isValid()) {
            let newModel = {
                model_number: this.state.newModel.model_number,
                vendor: this.state.newModel.vendor.label,
                calibration_frequency: this.state.newModel.calibration_frequency,
                comment: this.state.newModel.comment,
                description: this.state.newModel.description
            }
            this.props.onSubmit(newModel);
            this.onClose();
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

export default AddModelPopup;
