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
import { useDrag, useDrop } from "react-dnd";

class FormPopup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isEdit: true,
            allSteps: [0, 0, 0],
            form: [],
            errors: [],
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
        this.setStepNumber = this.setStepNumber.bind(this);
    }
    render() {
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
                onSubmit={this.props.onSubmit}
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
        for (var i = 0; i < this.state.form.length; i++) {
            if (this.state.form[i].type === 'header') {
                form.push(<Header id={i} headerInput={this.state.form[i].text} setHeader={this.setText} setStepNumber={this.setStepNumber}></Header>);
            }
            else if(this.state.form[i].type === "numeric"){
                form.push(<NumericInput id={i} max={this.state.form[i].max} min={this.state.form[i].min} label={this.state.form[i].label} 
                                        setMax={this.setMax} setMin={this.setMin} setLabel={this.setLabel} setStepNumber={this.setStepNumber}></NumericInput>)
            }
            else if(this.state.form[i].type === "text-area"){
                form.push(<TextArea id={i} instructions={this.state.form[i].text} setInstructions={this.setText} setStepNumber={this.setStepNumber}></TextArea>)
            }
            else if(this.state.form[i].type === "plain-text"){
                form.push(<PlainText id={i} text={this.state.form[i].text} setText={this.setText} setStepNumber={this.setStepNumber}></PlainText>)
            }
            else if(this.state.form[i].type === "text-input"){
                form.push(<TextInput id={i} text={this.state.form[i].text} setText={this.setText} setStepNumber={this.setStepNumber}></TextInput>)
            }
            else if(this.state.form[i].type === "check-input"){
                form.push(<Check id={i} label={this.state.form[i].text} setLabel={this.setText} setStepNumber={this.setStepNumber}></Check>)
            }
        }
        return form;
    }

    addHeader() {
        let item = {
            type: 'header',
            text: '',
        }
        this.setState({
            form: this.state.form.concat([item])
        })
    }

    addNumeric() {
        let item = {
            type: 'numeric',
            max: '',
            min: '',
            label: '',

        }
        this.setState({
            form: this.state.form.concat([item])
        })
    }

    addTextArea() {
        let item = {
            type: 'text-area',
            text: '',
        }
        this.setState({
            form: this.state.form.concat([item])
        })
    }

    addPlainText() {
        let item = {
            type: 'plain-text',
            text: '',
        }
        this.setState({
            form: this.state.form.concat([item])
        })
    }

    addTextInput() {
        let item = {
            type: 'text-input',
            text: '',
        }
        this.setState({
            form: this.state.form.concat([item])
        })
    }

    addCheckInput() {
        let item = {
            type: 'check-input',
            text: '',
        }
        this.setState({
            form: this.state.form.concat([item])
        })
    }

    setText(i, value) {
        let form = this.state.form;
        form[i]['text'] = value;
        this.setState({
            form: form
        })
    }

    setMax(i, value) {
        let form = this.state.form;
        form[i]['max'] = value;
        this.setState({
            form: form
        })
    }

    setMin(i, value) {
        let form = this.state.form;
        form[i]['min'] = value;
        this.setState({
            form: form
        })
    }

    setMin(i, value) {
        let form = this.state.form;
        form[i]['min'] = value;
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
}





export default FormPopup;