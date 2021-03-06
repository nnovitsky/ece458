import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';
import Select from 'react-select/creatable';
import ModelServices from '../../api/modelServices';
import GenericPopup from '../generic/GenericPopup';
import CalModePicklist from '../generic/picklist/CalModePicklist';
import ModelCategoriesPicklist from '../generic/picklist/ModelCategoriesPicklist';
import VendorPicklist from '../generic/picklist/VendorPicklist';

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
                    vendor: props.currentModel.vendor,
                    description: props.currentModel.description,
                    comment: props.currentModel.comment,
                    calibration_frequency: props.currentModel.calibration_frequency,
                    categories: props.currentModel.categories,
                    calibration_modes: props.currentModel.calibration_modes,
                },
                vendorsArr: null,
            }
        } else {
            this.state = {
                isEdit: false,
                newModel: {
                    model_pk: '',
                    model_number: '',
                    vendor: '',
                    description: '',
                    comment: '',
                    calibration_frequency: '',
                    categories: [],
                    calibration_modes: [], 
                },
                vendorsArr: null
            }
        }

        this.onSubmit = this.onSubmit.bind(this);
        this.onTextInput = this.onTextInput.bind(this);
        this.onCategoryInput = this.onCategoryInput.bind(this);
        this.onVendorInput = this.onVendorInput.bind(this);
        this.onCalModeInput = this.onCalModeInput.bind(this);
        this.onClose = this.onClose.bind(this);
        //this.getVendorsArr = this.getVendorsArr.bind(this);
    }

    async componentDidMount() {

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
                onClose={this.onClose}
                onSubmit={this.onSubmit}
                submitButtonVariant="primary"
                errors={this.props.errors}
            />
        )
    }

    makeBody() {
        let categoryPicklist = (
            <ModelCategoriesPicklist
                selectedCategories={this.state.newModel.categories}
                onChange={this.onCategoryInput}
            />
        )
        return (
            <Form className="popup">
                <Form.Label className="required-field">Vendor</Form.Label>
                <VendorPicklist
                    selectedVendor={this.state.newModel.vendor}
                    onChange={this.onVendorInput}
                    isCreatable={true}
                />
                <Form.Label className="required-field">Model Number</Form.Label>
                <Form.Control required type="text" value={this.state.newModel.model_number} name={modelName} onChange={this.onTextInput} placeholder="Enter Model Number" />

                
                <Form.Label className="required-field">Description</Form.Label>
                <Form.Control required type="text" value={this.state.newModel.description} name={descriptionName} onChange={this.onTextInput} placeholder="Enter Description" />

                <Form.Label>Comments</Form.Label>
                <Form.Control as="textarea" rows={3} value={this.state.newModel.comment} name={commentName} onChange={this.onTextInput} />
                {/* <CalModePicklist
                    selectedMode={this.state.newModel.calMode}
                    onChange={this.onCalModeInput}
                /> */}


                <Form.Label>Calibration Frequency (days)</Form.Label>
                <Form.Control required type="text" value={this.state.newModel.calibration_frequency} name={callibrationName} onChange={this.onTextInput} placeholder="Enter Calibration Frequency" />
                <Form.Text muted>If not calibratable, leave empty</Form.Text>

                <Form.Label>Calibration Mode</Form.Label>
                <Form.Check type="checkbox" label="Load Bank" onChange={this.onCalModeInput} checked={this.isLoadBank()} />

                <Form.Label>Model Categories</Form.Label>
                {categoryPicklist}
            </Form>
        )
    }

    isLoadBank() {
        let result = false;
        this.state.newModel.calibration_modes.forEach(el => {
            if (el.name == "load_bank") {
                result = true;
            }
        })
        return result;
    }

    onVendorInput(e) {
        this.setState({
            newModel: {
                ...this.state.newModel,
                vendor: e
            }
        })
    }

    onCategoryInput(categoryList) {
        this.setState({
            newModel: {
                ...this.state.newModel,
                categories: categoryList
            }
        })
    }

    onCalModeInput(e) {
        this.setState({
            newModel: {
                ...this.state.newModel,
                calibration_modes: (e.target.checked ? ["load_bank"] : [])
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
                vendor: this.state.newModel.vendor,
                calibration_frequency: this.state.newModel.calibration_frequency,
                comment: this.state.newModel.comment,
                description: this.state.newModel.description,
                categories: this.state.newModel.categories,
                calibration_modes: this.state.newModel.calibration_modes
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
            vendorsArr: null,
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
