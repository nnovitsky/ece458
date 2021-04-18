import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';
import ModelServices from '../../api/modelServices';
import GenericPopup from '../generic/GenericPopup';
import ModelCategoriesPicklist from '../generic/picklist/ModelCategoriesPicklist';
import VendorPicklist from '../generic/picklist/VendorPicklist';
import { CalibrationModeDisplayMap } from '../generic/Util';

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
                    calibrator_categories_set: props.currentModel.calibrator_categories_set,
                    requires_approval: props.currentModel.requires_approval,
                },
                calibratorCategories: {
                    klufe_k5700: [
                        { name: 'Klufe_K5700-compatible', pk: 125 },
                    ],
                    load_bank: [
                        { name: 'current_shunt_meter', pk: 129 },
                        { name: 'voltmeter', pk: 126 },
                    ],
                },
                allCalModes: [],
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
                    calibrator_categories_set: [],
                    requires_approval: false,
                },
                calibratorCategories: {
                    klufe_k5700: [
                        { name: 'Klufe_K5700-compatible', pk: 125 },
                    ],
                    load_bank: [
                        { name: 'current_shunt_meter', pk: 129 },
                        { name: 'voltmeter', pk: 126 },
                    ],
                },
                allCalModes: [],
            }
        }

        this.onSubmit = this.onSubmit.bind(this);
        this.onTextInput = this.onTextInput.bind(this);
        this.onCategoryInput = this.onCategoryInput.bind(this);
        this.onVendorInput = this.onVendorInput.bind(this);
        this.onCalModeInput = this.onCalModeInput.bind(this);
        this.onCalibratedWithInput = this.onCalibratedWithInput.bind(this);
        this.onRequiresValidationInput = this.onRequiresValidationInput.bind(this);
        this.onClose = this.onClose.bind(this);
    }

    async componentDidMount() {
        await modelServices.getCalModes().then((result) => {
            if (result.success) {
                this.setState({
                    allCalModes: result.data.modes,
                })
            } else {
                console.log(`Failed to get the cal modes for the add/edit model popup`);
                console.log(result.errors);
            }
        })
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
        const categoryPicklist = (
            <ModelCategoriesPicklist
                selectedCategories={this.state.newModel.categories}
                onChange={this.onCategoryInput}
            />
        )
        const calibratedWithPicklist = (
            <ModelCategoriesPicklist
                selectedCategories={this.state.newModel.calibrator_categories_set}
                onChange={this.onCalibratedWithInput}
                isDisabled={this.isChecked('load_bank') || this.isChecked('klufe_k5700')}
            />
        );
        const calModes = this.state.newModel.calibration_modes;
        const isLoadBankOrKlufe = calModes.includes('load_bank') || calModes.includes('klufe_k5700');
        const calibratableSection = (
            <>
                <Form.Label>Calibrator Categories</Form.Label>
                { calibratedWithPicklist}
                <Form.Text muted hidden={!isLoadBankOrKlufe}>Calibrator categories for this calibration mode cannot be changed</Form.Text>
                <Form.Label>Specialty Calibration Mode</Form.Label>
                { this.makeCheckboxes()}
                <Form.Text muted>Must have a calibration frequency and only one mode may be selected</Form.Text>
                <Form.Text muted hidden={!this.isChecked('custom_form')}>The custom form editor will open on the creation of the model</Form.Text>
                <Form.Label>Validation</Form.Label>
                <Form.Check
                    id="validation-box"
                    type="checkbox"
                    label="Calibration Requires Validation"
                    onChange={this.onRequiresValidationInput}
                    checked={this.state.newModel.requires_approval}
                />
            </>
        );
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
                <Form.Label>Model Categories</Form.Label>
                {categoryPicklist}

                <Form.Label>Calibration Frequency (days)</Form.Label>
                <Form.Control required type="text" value={this.state.newModel.calibration_frequency} name={callibrationName} onChange={this.onTextInput} placeholder="Enter Calibration Frequency" />
                <Form.Text muted>If not calibratable, leave empty</Form.Text>
                {this.isCalibratable() ? calibratableSection : null}
            </Form>
        )
    }

    makeCheckboxes() {
        const checkBoxes = [];
        this.state.allCalModes.forEach((calMode) => {
            const box = (
                <Form.Check
                    id={calMode}
                    type="checkbox"
                    label={CalibrationModeDisplayMap[calMode]}
                    onChange={(e) => this.onCalModeInput(calMode, e.target.checked)}
                    checked={this.isChecked(calMode)}
                    disabled={this.isDisabled(calMode)} />
            );
            checkBoxes.push(box);
        });
        return checkBoxes;
    }

    isChecked(calMode) {
        const newModel = this.state.newModel;
        return newModel.calibration_modes.includes(calMode);
    }

    isDisabled(calMode) {
        const newModel = this.state.newModel;

        const isSelectedCalMode = newModel.calibration_modes.includes(calMode);
        const hasNoCalMode = newModel.calibration_modes.includes(null) || newModel.calibration_modes.length === 0;

        if (isSelectedCalMode) {
            return false;
        }
        if (!this.isCalibratable()) {
            return true;
        }
        return !hasNoCalMode;
    }

    isCalibratable() {
        const newModel = this.state.newModel;
        const calFrequency = newModel.calibration_frequency;
        return calFrequency > 0 && !isNaN(calFrequency);
    }

    onCalModeInput(calMode, isChecked) {
        this.setState(prevState => {
            let calibratorCategories = prevState.newModel.calibrator_categories_set;
            if (calMode === 'load_bank' || calMode === 'klufe_k5700') {
                if(isChecked) {
                    calibratorCategories = this.state.calibratorCategories[calMode];
                } else {
                    calibratorCategories = [];
                }
            }
            return {
                newModel: {
                    ...this.state.newModel,
                    calibration_modes: (isChecked ? [calMode] : []),
                    calibrator_categories_set: calibratorCategories,
                }
            }
        })
    }

    onRequiresValidationInput() {
        this.setState(prevState => {
            const wasChecked = prevState.newModel.requires_approval;
            return {
                newModel: {
                    ...this.state.newModel,
                    requires_approval: !wasChecked,
                }
            }
        })
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

    onCalibratedWithInput(calWithList) {
        this.setState({
            newModel: {
                ...this.state.newModel,
                calibrator_categories_set: calWithList
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
                        calibration_frequency: val,
                    }
                }, () => {
                    // resets all the calibration fields if its no longer calibratable
                    if(!this.isCalibratable()) {
                        this.setState({
                            newModel: {
                                ...this.state.newModel,
                                calibration_modes: [],
                                requires_approval: false,
                                calibrator_categories_set: [],
                            }
                        })
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
                calibration_modes: this.state.newModel.calibration_modes,
                calibrator_categories_set: this.state.newModel.calibrator_categories_set,
                requires_approval: this.state.newModel.requires_approval,
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
                calibration_modes: [],
                calibrator_categories_set: [],

            },
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
