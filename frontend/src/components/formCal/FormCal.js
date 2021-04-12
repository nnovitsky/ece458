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

class FormCal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            data: [],
            onFormStep: false,
            date_string: dateToString(new Date()),
            date_object: new Date(),
            comment: '',
        }

        this.onNumericInput = this.onNumericInput.bind(this);
        this.onTextInput = this.onTextInput.bind(this);
        this.onBoolInput = this.onBoolInput.bind(this);
        this.onDateChange = this.onDateChange.bind(this);
        this.onCommentInput = this.onCommentInput.bind(this);
        this.makeCalEvent = this.makeCalEvent.bind(this);
    }

    async componentDidMount() {
        //await this.getForm();
        this.setState({
            data: FormData.data
        })
    }

    render() {
        let body = this.makeBody();
        return (
            <GenericPopup
                show={this.props.isShown}
                body={body}
                headerText="Form Calibration"
                closeButtonText="Cancel"
                submitButtonText={this.state.onFormStep ? "Submit Calibration" : "Next"}
                onClose={this.props.onClose}
                onSubmit={this.state.onFormStep ? this.props.onSubmit : this.makeCalEvent}
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
        console.log(this.state.data)
        return <div>
            <Form>
                {this.state.onFormStep ? formItems : introItems}
            </Form>
        </div>
    }

    makeIntro() {
        return <div>
            <Form.Group>
                <Form.Label className="required-field">Calibration Date</Form.Label>
                <div style={{ display: 'block' }}>
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
            switch (formField.type) {
                case "HEADER":
                    group = this.getHeaderForm(formField);
                    break;
                case "MESSAGE":
                    group = this.getPlainTextForm(formField);
                    break;
                case "TEXT_INPUT":
                    group = this.getTextInput(formField, i);
                    break;
                case "CHECK":
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

    makeCalEvent(){
        
        this.setState({
            onFormStep: true
        })
    }


    getHeaderForm(formField) {
        return <HeaderGroup
            text={formField.label} />

    }

    getPlainTextForm(formField) {
        return <PlainTextGroup
            text={formField.plain_text} />
    }

    getTextInput(formField, id) {
        return <TextInputGroup
            value={formField.actual_text}
            label={formField.label}
            id={id}
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
        let field = this.state.data[id]
        field.actual_float = newVal
        data[id].actual_float = newVal

        this.setState({
            data: data
        })
        if (newVal > this.state.data[id].expected_max) {
            this.setState({
                errors: [`Invalid input for Step ${Number(id) + 1}: input greater than ${this.state.data[id].expected_max}`]
            })
        }
        else if (newVal < this.state.data[id].expected_min) {
            this.setState({
                errors: [`Invalid input for Step ${Number(id) + 1}: input less than ${this.state.data[id].expected_min}`]
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
        let field = this.state.data[id]
        field.actual_text = newText
        data[id].actual_text = newText

        this.setState({
            data: data
        })
    }

    onBoolInput(e) {
        const newBool = e.target.checked;
        const id = e.target.id;
        let data = this.state.data;
        let field = this.state.data[id]
        field.actual_bool = newBool
        data[id].actual_bool = newBool

        this.setState({
            data: data
        })
    }
}

export default FormCal;
