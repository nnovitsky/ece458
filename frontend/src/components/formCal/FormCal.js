import React from 'react'
import GenericPopup from '../generic/GenericPopup';
import FormData from './Form.json'
import Form from 'react-bootstrap/Form';
import NumericFormGroup from './formGroups/NumericFormGroup.js';
import TextInputGroup from './formGroups/TextInputGroup.js';
import PlainTextGroup from './formGroups/PlainTextGroup.js';
import CheckInputGroup from './formGroups/CheckInputGroup.js';
import HeaderGroup from './formGroups/HeaderGroup.js';
import DatePicker from 'react-datepicker';
import { dateToString } from '../generic/Util';
import FormCalServices from "../../api/formCalServices";
import CalibratedWithInput from '../instrument/CalibratedWithInput.js';

const formCalServices = new FormCalServices();

class FormCal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            data: [],
            date_string: dateToString(new Date()),
            date_object: new Date(),
            comment: '',
            instrument_pk: props.instrument_pk,
            model_pk: this.props.model_pk,
            cal_event_pk: '',
            calibrator_instruments: [],
            calibrator_categories: this.props.calibratorCategories,
        }

        this.onNumericInput = this.onNumericInput.bind(this);
        this.onTextInput = this.onTextInput.bind(this);
        this.onBoolInput = this.onBoolInput.bind(this);
        this.onDateChange = this.onDateChange.bind(this);
        this.onCommentInput = this.onCommentInput.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.getForm = this.getForm.bind(this);
        this.getLabel = this.getLabel.bind(this);
        this.onCalibratorInstrumentsChange = this.onCalibratorInstrumentsChange.bind(this);
    }

    async componentDidMount() {
        await this.getForm();
    }

    render() {
        let body = this.makeBody();
        return (
            <GenericPopup
                show={this.props.isShown}
                body={body}
                headerText="Form Calibration"
                closeButtonText="Cancel"
                submitButtonText={"Submit Calibration"}
                onClose={this.props.onClose}
                onSubmit={this.submitForm}
                submitButtonVariant="primary"
                errors={this.state.errors}
                isPrimaryEnabled={true}
                keyboard={false}
                backdrop="static"
            />
        );
    }

    makeBody() {
        let formItems = this.makeForm();
        let introItems = this.makeIntro();
        return (<div>
            <Form>
                {introItems}
                {formItems}
                <CalibratedWithInput 
                    onInstrumentChange={this.onCalibratorInstrumentsChange}
                    calibratorCategories={this.state.calibrator_categories}
                    instrumentPk={this.state.instrument_pk}
                /> 
            </Form>
        </div>)
    }

    onCalibratorInstrumentsChange(instrumentsArr){
        this.setState({
            calibrator_instruments: instrumentsArr
        })
    }

    makeIntro() {
        return <div>
            <Form.Group>
                <Form.Label className="required-field">Calibration Date</Form.Label>
                <div style={{ display: 'block', marginLeft: "-10px" }}>
                    <DatePicker
                        onChange={this.onDateChange}
                        selected={this.state.date_object}
                        maxDate={new Date()}
                    />
                </div>
                <Form.Text muted>
                    Cannot be in the future
        </Form.Text>
            </Form.Group>
            <Form.Group>
                <Form.Label>Comment</Form.Label>
                <Form.Control as="textarea" rows={3} onChange={this.onCommentInput} />
                <Form.Text muted>
                    Max 2000 characters
        </Form.Text>
            </Form.Group>
        </div>
    }

    makeForm() {
        let form = []
        for (let i = 0; i < this.state.data.length; i++) {
            let group;
            let formField = this.state.data[i];
            switch (formField.fieldtype) {
                case "HEADER":
                    group = this.getHeaderForm(formField);
                    break;
                case "PLAINTEXT":
                    group = this.getPlainTextForm(formField);
                    break;
                case "TEXT_INPUT":
                    group = this.getTextInput(formField, i);
                    break;
                case "BOOL_INPUT":
                    group = this.getCheckInput(formField, i);
                    break
                case "FLOAT_INPUT":
                    group = this.getNumericInput(formField, i);
                    break;
                default:
                    group = <Form.Group></Form.Group>
                    break;
            }
            form.push(group);
        }
        return form;
    }

    onDateChange(e) {
        this.setState({
            date_string: dateToString(e),
            date_object: e
        })
    }

    onCommentInput(e) {
        this.setState({
            comment: e.target.value
        })
    }

    async getForm() {
        formCalServices.getExistingForm(this.state.model_pk)
            .then(result => {
                if (result.success) {
                    this.setState({
                        data: result.data,
                        errors: []
                    })
                }

            })
    }

    async submitForm() {
        formCalServices.submitFormData(this.state.instrument_pk, this.state.date_string, this.state.comment, this.state.data)
            .then(result => {
                if (result.success) {
                    this.setState({
                        errors: []
                    })
                    this.props.onClose();
                    
                } else {
                    if(result.errors.form_error){
                        let err = result.errors.form_error[0]
                        let message;
                        if(err.error.actual_string) { message = err.error.actual_string }
                        else { message = err.error }
                        this.setState({
                            errors: [`Invalid input for [${this.getLabel(err.index - 1)}]: ` + message]
                        })
                    }
                }
            })
    }


    getHeaderForm(formField) {
        return <HeaderGroup
            text={formField.label} />

    }

    getPlainTextForm(formField) {
        return <PlainTextGroup
            text={formField.plaintext} />
    }

    getTextInput(formField, id) {
        return <TextInputGroup
            value={formField.actual_string}
            label={formField.label}
            id={id}
            expected_string={formField.expected_string}
            onChange={this.onTextInput} />
    }

    getCheckInput(formField, id) {
        return <CheckInputGroup
            value={formField.actual_bool}
            label={formField.label}
            id={id}
            onChange={this.onBoolInput} />
    }

    getNumericInput(formField, id) {
        return <NumericFormGroup
            id={id}
            value={this.state.data[id].actual_float}
            label={formField.label}
            min={formField.expected_min}
            max={formField.expected_max}
            onChange={this.onNumericInput}
        />
    }

    onNumericInput(e) {
        const newVal = e.target.value;
        const id = e.target.id;
        let data = this.state.data;
        if(newVal !== '') data[id].actual_float = Number(newVal)
        else data[id].actual_float = newVal

        this.setState({
            data: data
        })
        if (data[id].expected_max !== '' && data[id].expected_max !== null && newVal > this.state.data[id].expected_max) {
            this.setState({
                errors: [`Invalid input for [${this.getLabel(id)}]: input greater than ${this.state.data[id].expected_max}`]
            })
        }
        else if (data[id].expected_min !== '' && data[id].expected_min !== null && newVal < this.state.data[id].expected_min) {
            this.setState({
                errors: [`Invalid input for [${this.getLabel(id)}]: input less than ${this.state.data[id].expected_min}`]
            })
        }
        else {
            this.setState({
                errors: []
            })
        }
    }

    onTextInput(e) {
        const newText = e.target.value;
        const id = e.target.id;
        let data = this.state.data;
        data[id].actual_string = newText

        this.setState({
            data: data
        })

        if (data[id].expected_string !== '' && data[id].expected_string !== null && data[id].expected_string !== newText) {
            this.setState({
                errors: [`Invalid input for [${this.getLabel(id)}]: Value does not match expected string.`]
            })
        } else {
            this.setState({
                errors: []
            })
        }
    }

    onBoolInput(e) {
        const id = e.target.id;
        const newBool = !this.state.data[id].actual_bool;
        let data = this.state.data;
        let field = this.state.data[id]
        field.actual_bool = newBool
        data[id].actual_bool = newBool

        this.setState({
            data: data
        })
    }

    getLabel(index){
        return this.state.data[index].label
    }
}

export default FormCal;
