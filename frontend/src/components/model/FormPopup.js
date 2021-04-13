import React, { Component, useState } from 'react';
import Form from 'react-bootstrap/Form';
import GenericPopup from '../generic/GenericPopup';
import FormDnD from './FormDnD.js'
import NewStep from './formObjects/NewStep.js'
import Header from './formObjects/Header.js'
import TextArea from './formObjects/TextArea.js'
import PlainText from './formObjects/PlainText.js'
import NumericInput from './formObjects/NumericInput.js'
import TextInput from './formObjects/TextInput.js'
import Check from './formObjects/Check.js'
import './FormPopup.css'
import FormCalServices from "../../api/formCalServices";

const formCalServices = new FormCalServices();

class FormPopup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isEdit: true,
            allSteps: [0, 0, 0],
            form: [''],
            errors: [],
            model_pk: this.props.model_pk
        }

        this.addHeader = this.addHeader.bind(this);
        this.addNumeric = this.addNumeric.bind(this);
        this.addTextArea = this.addTextArea.bind(this);
        this.addPlainText = this.addPlainText.bind(this);
        this.addTextInput = this.addTextInput.bind(this);
        this.addCheckInput = this.addCheckInput.bind(this);
        this.setText = this.setText.bind(this);
        this.setMax = this.setMax.bind(this);
        this.setMin = this.setMin.bind(this);
        this.setLabel = this.setLabel.bind(this);
        this.setPlaintext = this.setPlaintext.bind(this);
        this.setStepNumber = this.setStepNumber.bind(this);
        this.deleteStep = this.deleteStep.bind(this);
        this.getExistingForm = this.getExistingForm.bind(this);
        this.makeExistingForm = this.makeExistingForm.bind(this);
        this.makeBody = this.makeBody.bind(this);
        this.createForm = this.createForm.bind(this);
    }
    async componentDidMount(){
        console.log("here")
        await this.getExistingForm();
    }

    render() {
        console.log(this.state.form)
        let body = this.makeBody();
        let bodyText = (this.state.isEdit) ? "Edit Form" : "Create Form";
        let submitText = (this.state.isEdit) ? "Submit Changes" : "Create Form";

        return (
            <GenericPopup
                show={this.props.isShown}
                body={body}
                headerText={bodyText}
                closeButtonText="Cancel"
                submitButtonText={submitText}
                onClose={this.props.onClose}
                onSubmit={this.createForm}
                submitButtonVariant="primary"
                errors={this.state.errors}
                size={"xl"}
            />
        )
    }

    makeBody() {
        let existingForm = this.makeExistingForm();
        let header = <div>
            <span style={{float: "left", marginLeft: "4%"}}>Step</span>
            <span style={{float: "left", marginLeft: "43%"}}>Preview of Form</span>
        </div>
        return (
            <div>
                <div className="form-builder-workspace">
                    {this.state.form.length > 0 ? header : null}
                    {existingForm}
                    <NewStep addHeader={this.addHeader} addNumeric={this.addNumeric} addTextArea={this.addTextArea}
                            addPlainText={this.addPlainText} addTextInput={this.addTextInput} addCheckInput={this.addCheckInput}/>
                </div>
            </div>
        )
    }

    makeExistingForm() {
        var form = [];
        console.log(this.state.form)
        for (var i = 0; i < this.state.form.length; i++) {
            if (this.state.form[i].fieldtype === 'HEADER') {
                form.push(<Header id={i} headerInput={this.state.form[i].label} setHeader={this.setLabel} setStepNumber={this.setStepNumber}
                                        onDelete={this.deleteStep}></Header>);
            }
            else if(this.state.form[i].fieldtype === "FLOAT_INPUT"){
                form.push(<NumericInput id={i} max={this.state.form[i].expected_max} min={this.state.form[i].expected_min} label={this.state.form[i].label} 
                                        setMax={this.setMax} setMin={this.setMin} setLabel={this.setLabel} setStepNumber={this.setStepNumber}
                                        onDelete={this.deleteStep}></NumericInput>)
            }
            else if(this.state.form[i].fieldtype === "PLAINTEXT"){
                form.push(<PlainText id={i} text={this.state.form[i].plaintext} setText={this.setPlaintext} setStepNumber={this.setStepNumber}
                                        onDelete={this.deleteStep}></PlainText>)
            }
            else if(this.state.form[i].fieldtype === "TEXT_INPUT"){
                form.push(<TextInput id={i} label={this.state.form[i].label} expected_text={this.state.form[i].expected_string} setText={this.setText} setLabel={this.setLabel} 
                                        setStepNumber={this.setStepNumber} onDelete={this.deleteStep}></TextInput>)
            }
            else if(this.state.form[i].fieldtype === "BOOL_INPUT"){
                form.push(<Check id={i} label={this.state.form[i].label} setLabel={this.setLabel} setStepNumber={this.setStepNumber}
                                        onDelete={this.deleteStep}></Check>)
            }
        }
        return form;
    }

    getExistingForm(){
        formCalServices.getExistingForm(this.state.model_pk).then(result => {
            if(result.success){
                this.setState({
                    form: result.data
                })
            }
            else {
                console.log("error")
            }
        }) 
    }

    createForm(){
        formCalServices.createForm(this.state.form, this.state.model_pk).then(result => {
            if(result.success){
                this.props.close()
            }
            else {
                console.log(result)
            } 
        })
    }

    addHeader() {
        let item = {
            fieldtype: 'HEADER',
            label: '',
        }
        this.setState({
            form: this.state.form.concat([item])
        })
    }

    addNumeric() {
        let item = {
            fieldtype: 'FLOAT_INPUT',
            expected_max: '',
            expected_min: '',
            label: '',

        }
        this.setState({
            form: this.state.form.concat([item])
        })
    }

    addTextArea() {
        let item = {
            fieldtype: 'text-area',
            text: '',
        }
        this.setState({
            form: this.state.form.concat([item])
        })
    }

    addPlainText() {
        let item = {
            fieldtype: 'PLAINTEXT',
            plaintext: '',
        }
        this.setState({
            form: this.state.form.concat([item])
        })
    }

    addTextInput() {
        let item = {
            fieldtype: 'TEXT_INPUT',
            label: '',
        }
        this.setState({
            form: this.state.form.concat([item])
        })
    }

    addCheckInput() {
        let item = {
            fieldtype: 'BOOL_INPUT',
            label: '',
        }
        this.setState({
            form: this.state.form.concat([item])
        })
    }

    setText(i, value) {
        let form = this.state.form;
        form[i]['expected_text'] = value;
        this.setState({
            form: form
        })
    }
    setPlaintext(i, value) {
        let form = this.state.form;
        form[i]['plaintext'] = value;
        this.setState({
            form: form
        })
    }

    setMax(i, value) {
        let form = this.state.form;
        form[i]['expected_max'] = value;
        this.setState({
            form: form
        })
    }

    setMin(i, value) {
        let form = this.state.form;
        form[i]['expected_min'] = value;
        this.setState({
            form: form
        })
    }

    setLabel(i, value){
        let form = this.state.form;
        form[i]['label'] = value;
        this.setState({
            form: form
        })
    }

    setStepNumber(i, value){
        let newIndex = value - 1;
        console.log(newIndex)
        if(newIndex > this.state.form.length - 1 || newIndex < 0){
            console.log("error")
            this.setState({
                errors: [`Invalid Step Number: Please choose a number from 1 to ${this.state.form.length}`]
            })
            return false;
        }

        this.setState({
            errors: []
        })

        if(i === newIndex) return false;
        let form = [...this.state.form];
        let item = this.state.form[i];
        if(i < newIndex){
            form.splice(newIndex + 1, 0, item);
            form.splice(i, 1)
        }
        else{
            form.splice(newIndex, 0, item);
            form.splice(i + 1, 1)
        }
        console.log(form)
        this.setState({
            form: form
        }) 
        return true;
    }

    deleteStep(i)
    {
        let form = this.state.form;
        form.splice(i, 1)
        this.setState({
            form: form
        })
    }
}





export default FormPopup;