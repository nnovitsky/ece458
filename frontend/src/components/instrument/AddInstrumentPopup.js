import React, { Component } from 'react';
import Form from "react-bootstrap/Form";
import Select from 'react-select';

import ModelServices from '../../api/modelServices';
import InstrumentCategoryPicklist from '../generic/picklist/InstrumentCategoriesPicklist';
import "react-datepicker/dist/react-datepicker.css";
import GenericPopup from "../generic/GenericPopup";
import VendorPicklist from '../generic/picklist/VendorPicklist';

//props
//'isShown' a boolean if the popup is visible
//'onSubmit' a handler that will be passed the new instrument information
//'onClose' a handler for when the popup is closed NOTE: called after a function in this file
//'currentInstrument' an object formatted exactly like newInstrument below, can also pass null if no pre-existing
//'errors' an array of strings of errors to display

// let newInstrument = {
//     model_pk: '',
//      model_number,
//     vendor: '',
//     serial_number: '',
//     comment: '',
//}

const modelServices = new ModelServices();



class AddInstrumentPopup extends Component {

    constructor(props) {
        super(props);
        //for whatever reason the select compne
        if (props.currentInstrument !== null) {
            this.state = {
                isEdit: true,
                newInstrument: {
                    model_pk: props.currentInstrument.model_pk,
                    model: {
                        label: props.currentInstrument.model_number,
                        number: props.currentInstrument.model_pk
                    },
                    vendor: props.currentInstrument.vendor,
                    serial_number: props.currentInstrument.serial_number,
                    comment: props.currentInstrument.comment,
                    instrument_categories: props.currentInstrument.instrument_categories,
                    asset_tag: props.currentInstrument.asset_tag
                },
                vendorsArr: null,
                modelsFromVendorArr: []
            }
        } else {
            this.state = {
                isEdit: false,
                newInstrument: {
                    model_pk: '',
                    model: {
                        label: '',
                        number: ''
                    },
                    vendor: '',
                    serial_number: '',
                    comment: '',
                    instrument_categories: [],
                    asset_tag: ''
                },
                modelsFromVendorArr: []
            }
        }
        this.onVendorInput = this.onVendorInput.bind(this);
        this.onModelInput = this.onModelInput.bind(this);
        this.onSerialChange = this.onSerialChange.bind(this);
        this.onCommentChange = this.onCommentChange.bind(this);
        this.onCategoryChange = this.onCategoryChange.bind(this);
        this.onAssetChange = this.onAssetChange.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

    }

    render() {
        let body = this.makeBody();

        let headerText = (this.state.isEdit) ? "Edit Instrument" : "Create Instrument";
        let submitText = (this.state.isEdit) ? "Submit Changes" : "Create Instrument";
        return (
            <GenericPopup
                show={this.props.isShown}
                body={body}
                headerText={headerText}
                closeButtonText="Cancel"
                submitButtonText={submitText}
                onClose={this.onClose}
                onSubmit={this.onSubmit}
                submitButtonVariant="primary"
                errors={this.props.errors}
            />
        )
    }

    makeBody = () => {
        let vendorModel = (this.state.isEdit) ? null : (
            <Form.Group>
                <Form.Label className="required-field">Vendor</Form.Label>
                <VendorPicklist
                    selectedVendor={this.state.newInstrument.vendor}
                    onChange={this.onVendorInput}
                />
                <Form.Label className="required-field">Model</Form.Label>
                <Select
                    value={this.state.newInstrument.model}
                    options={this.state.modelsFromVendorArr}
                    isSearchable={true}
                    onChange={this.onModelInput}
                    noOptionsMessage={() => "Select a Vendor"}
                />
                <Form.Text muted>
                    The vendor needs to be entered first.
                </Form.Text>
                </Form.Group>
        );

        return (
            <Form className="popup">
                {vendorModel}
                <Form.Group>
                    <Form.Label >Asset Number</Form.Label>
                    <Form.Control type="text" placeholder="Enter Asset Number" value={this.state.newInstrument.asset_tag} onChange={this.onAssetChange} />
                    <Form.Text muted>
                        Must be greater than or equal to 100000. If left blank, this will be autopopulated
  </Form.Text>
                </Form.Group>
                <Form.Group>
                    <Form.Label >Serial Number</Form.Label>
                    <Form.Control type="text" placeholder="Enter Serial" value={this.state.newInstrument.serial_number} onChange={this.onSerialChange} />
                    <Form.Text muted>
                        The serial number must be unique to the model.
                    </Form.Text>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Instrument Categories</Form.Label>
                    <InstrumentCategoryPicklist
                        selectedCategories={this.state.newInstrument.instrument_categories}
                        onChange={this.onCategoryChange}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Comments</Form.Label>
                    <Form.Control as="textarea" rows={3} value={this.state.newInstrument.comment} onChange={this.onCommentChange} />
                </Form.Group>



            </Form>
        )
    }

    //called by the filter field
    async onModelInput(e) {
        this.setState({
            newInstrument: {
                ...this.state.newInstrument,
                model_pk: e.value,
                model: {
                    label: e.label,
                    value: e.value,
                }
            }
        })
    }

    async onVendorInput(newVendor) {
        this.setState({
            newInstrument: {
                ...this.state.newInstrument,
                vendor: newVendor,
                model: {
                    label: '',
                    value: ''
                },
                model_pk: ''
            }
        })
        await modelServices.getModelByVendor(newVendor).then((result) => {
            if (result.success) {
                let formatted = result.data.map(opt => ({ label: opt.model_number, value: opt.pk }));
                this.setState({
                    modelsFromVendorArr: formatted
                })
                return;
            } else {
                this.setState({
                    modelsFromVendorArr: []
                })
            }
        })
    }

    onCategoryChange = (categoryList) => {
        this.setState({
            newInstrument: {
                ...this.state.newInstrument,
                instrument_categories: categoryList
            }
        })
    }

    onSerialChange = (e) => {
        this.setState({
            newInstrument: {
                ...this.state.newInstrument,
                serial_number: e.target.value
            }
        })
    }

    onAssetChange = (e) => {
        this.setState({
            newInstrument: {
                ...this.state.newInstrument,
                asset_tag: e.target.value
            }
        })
    }

    onCommentChange = (e, setInstrumentState) => {
        this.setState({
            newInstrument: {
                ...this.state.newInstrument,
                comment: e.target.value
            }
        })
    }

    onAssetChange = (e) => {
        this.setState({
            newInstrument: {
                ...this.state.newInstrument,
                asset_number: e.target.value
            }
        })
    }

    onClose = (e) => {
        this.props.onClose(e);
        if (!this.state.isEdit) {
            this.resetState();
        }
    }

    onSubmit = (e) => {
        if (this.isValid()) {
            let returnedInstrument = {
                model_pk: this.state.newInstrument.model_pk,
                vendor: this.state.newInstrument.vendor.value,
                comment: this.state.newInstrument.comment,
                serial_number: this.state.newInstrument.serial_number,
                instrument_categories: this.state.newInstrument.instrument_categories,
                asset_tag: this.state.newInstrument.asset_tag

            }
            this.props.onSubmit(returnedInstrument);
        }
    }

    resetState() {
        this.setState({
            isEdit: false,
            newInstrument: {
                model_pk: '',
                model: {
                    label: '',
                    number: ''
                },
                vendor: {
                    label: '',
                    value: ''
                },
                serial_number: '',
                comment: '',
            },
            vendorsArr: null,
            modelsFromVendorArr: []
        })
    }

    isValid = () => {
        return true;
    }
}

AddInstrumentPopup.defaultProps = {
    errors: []
}

export default AddInstrumentPopup;