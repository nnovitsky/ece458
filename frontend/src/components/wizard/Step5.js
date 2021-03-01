import React from 'react'
import Base from './Base.js';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import './Wizard.css'



const vr = "vr";
const va = "va";

class Step5 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: [],
            voltage_reported: '',
            voltage_actual: '',
            test_voltage: 48,
            vr_error: 1,
            vr_ok: 'Yes',
            va_error: 10,
            va_ok: 'No',
            validated: false,

        }

        this.onTextInput = this.onTextInput.bind(this);
        this.validateVoltages = this.validateVoltages.bind(this);

    }


    render() {
        let body = this.makeBody();
        return (
            <Base
                isShown={this.props.isShown}
                errors={this.state.errors}
                onClose={this.props.onClose}
                body={body}
                incrementStep={this.props.incrementStep}
                decrementStep={this.props.decrementStep}
                disableContinue={!this.state.validated}

            />
        );
    }

    makeBody() {
        return <div>
            <Form className="wizard">
                <h3>Check Voltages</h3>
                <h5>Voltage with all load steps on:</h5>
                <Form.Group className="form-inline">
                    <Form.Label className="col-sm-2 col-form-label">Voltage Reported (display):</Form.Label>
                    <Form.Control type="text" placeholder={"input #"} name={vr} value={this.state.voltage_reported} onChange={this.onTextInput} />
                    <Form.Label className="col-sm-2 col-form-label">Voltage Actual (voltmeter):</Form.Label>
                    <Form.Control type="text" placeholder={"input #"} name={va} value={this.state.voltage_actual} onChange={this.onTextInput} />
                    <Button onClick={this.validateVoltages}>Validate</Button>
                </Form.Group>
                <h5>Output</h5>
                <Form.Group >
                    <Form.Label style={{display: "block"}}>Test Voltage: &nbsp;{this.state.test_voltage}V</Form.Label>
                    <Form.Label style={{display: "block"}}>VR Error: &nbsp;{this.state.vr_error}%</Form.Label>
                    <Form.Label style={{display: "block"}}>VR Ok?: &nbsp;{this.state.vr_ok}</Form.Label>
                    <Form.Label style={{display: "block"}}>VA Error: &nbsp;{this.state.va_error}%</Form.Label>
                    <Form.Label style={{display: "block"}}>VR Ok?: &nbsp;{this.state.va_ok}</Form.Label>
                </Form.Group>
            </Form>

        </div>
    }

    onTextInput(e) {
        let val = e.target.value;
        switch (e.target.name) {
            case vr:
                this.setState({
                    voltage_reported: val
                })
                return;
            case va:
                this.setState({
                    voltage_actual: val
                })
                return;
            default:
                return;
        }

    }

    async validateVoltages()
    {
        if(false)
        {

        }
        else 
        {
            this.setState({
                errors: [],
                validated: true
            })
        }
    }
}


export default Step5;