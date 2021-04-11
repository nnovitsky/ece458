import React from 'react'
import GenericPopup from '../generic/GenericPopup';
import FormData from './Form.json'
import Form from 'react-bootstrap/Form';
import NumericFormGroup from './formGroups/NumericFormGroup.js';
import TextInputGroup from './formGroups/TextInputGroup.js';
import PlainTextGroup from './formGroups/PlainTextGroup.js';

class FormCal extends React.Component {

    constructor(props) {
        super(props);
        this.state ={
            errors: [],
            data: [],
        }

        this.onNumericInput = this.onNumericInput.bind(this);
        this.onTextInput = this.onTextInput.bind(this);
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
            submitButtonText="Submit Calibration"
            onClose={this.props.onClose}
            onSubmit={this.props.onSubmit}
            submitButtonVariant="primary"
            errors={this.state.errors}
            isPrimaryEnabled={true}
            keyboard={false}
            backdrop="static"
        />
        );
    }

    makeBody(){
        let formItems = this.makeForm();
        return <div>
            <Form>
                {formItems}
            </Form>
        </div>
    }

    makeForm(){
        let form = []

        for (let i = 0; i < this.state.data.length; i++) {
            let group;
            let formField = this.state.data[i];
            switch(formField.type){
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
                    group = <Form.Group>Sup</Form.Group>
                    break;
            }
            form.push(group);
        }
        return form;
    }

    getHeaderForm(formField){
        return <Form.Group>
            <h5>{formField.text}</h5>
        </Form.Group>
    }

    getPlainTextForm(formField){
        return <PlainTextGroup
                text={formField.text}/>
    }

    getTextInput(formField, id){
        return <TextInputGroup
                value={formField.actual_text}
                label={formField.text}
                id={id}
                onChange={this.onTextInput}/>
    }

    getCheckInput(formField, id){
        return <Form.Group className="form-inline">
            <Form.Check className="required-field" id={id} label={formField.text} style={{marginLeft: "10px"}}></Form.Check>
        </Form.Group>
    }

    getNumericInput(formField, id){
        return <NumericFormGroup 
                    id={id} 
                    value={this.state.data[id].actual_float} 
                    label={formField.text}
                    min={formField.expected_min}
                    max={formField.expected_max}
                    onChange={this.onNumericInput}
                    />
    }

    onNumericInput(e){
        const newVal = e.target.value;
        const id = e.target.id;
        let data = this.state.data;
        let field = this.state.data[id]
        field.actual_float = newVal
        data[id].actual_float = newVal

        this.setState({
            data: data
        })
        if(newVal > this.state.data[id].expected_max){
            this.setState({
                errors: [`Invalid input for Step ${Number(id) + 1}: input greater than ${this.state.data[id].expected_max}`]
            })
        }
        else if(newVal < this.state.data[id].expected_min){
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

    onTextInput(e){
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
}

export default FormCal;
