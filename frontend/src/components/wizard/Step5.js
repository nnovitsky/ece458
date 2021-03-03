import React from 'react'
import Base from './Base.js';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import './Wizard.css'

import WizardServices from "../../api/wizardServices.js";

const wizardServices = new WizardServices();

const vr = "vr";
const va = "va";

class Step5 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: [],
            voltage_reported: '',
            voltage_actual: '',
            test_voltage: '',
            vr_error: '',
            vr_ok: '',
            va_error: '',
            va_ok: '',
            validated: false,
            validated_text: '',
            loadbank_pk: this.props.loadbank_pk,

        }

        this.onTextInput = this.onTextInput.bind(this);
        this.validateVoltages = this.validateVoltages.bind(this);

    }

    async componentDidMount() {
        await this.getTestVoltage();
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
                <h3>Check Voltages with all Load Steps on:</h3>
                <h5>Test Voltage: &nbsp;{this.state.test_voltage}V</h5>
                <Form.Group className="form-inline">
                    <Form.Label className="col-sm-2 col-form-label">Voltage Reported (display):</Form.Label>
                    <Form.Control type="text" placeholder={"input #"} name={vr} value={this.state.voltage_reported} onChange={this.onTextInput} />
                    <Form.Label className="col-sm-2 col-form-label">Voltage Actual (voltmeter):</Form.Label>
                    <Form.Control type="text" placeholder={"input #"} name={va} value={this.state.voltage_actual} onChange={this.onTextInput} />
                    <Button onClick={this.validateVoltages}>Validate</Button>
                </Form.Group>
                <h5>Output: {this.state.validated_text}</h5>
                <Form.Group >
                    <Form.Label style={{ display: "block" }}>VR Error: &nbsp;{this.state.vr_error}</Form.Label>
                    <Form.Label style={{ display: "block" }}>VR Ok?: &nbsp;{this.state.vr_ok}</Form.Label>
                    <Form.Label style={{ display: "block" }}>VA Error: &nbsp;{this.state.va_error}</Form.Label>
                    <Form.Label style={{ display: "block" }}>VR Ok?: &nbsp;{this.state.va_ok}</Form.Label>
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

    async validateVoltages() {
        wizardServices.addVoltageReading(Number(this.state.voltage_reported), Number(this.state.voltage_actual), Number(this.state.test_voltage), this.state.loadbank_pk)
            .then(result => {
                console.log(result)
                if (result.success) {
                    this.setState({
                        vr_error: result.data.vr_error.toFixed(3)*100 + "%",
                        va_error: result.data.va_error.toFixed(3)*100  + "%",
                        vr_ok: result.data.vr_ok ? "Yes" : "No",
                        va_ok: result.data.va_ok ? "Yes" : "No",
                        validated: (result.data.vr_ok && result.data.va_ok),
                        validated_text: (result.data.vr_ok && result.data.va_ok) ? "Valid" : "Invalid",
                    })
                    if(result.errors[0] !== null){
                        console.log("Here")
                        console.log(result.errors)
                        this.setState({
                            errors: result.errors
                        })
                    } else {
                        this.setState({
                            errors: []
                        })
                    }
                }
                else {
                    this.setState({
                        errors: result.errors,
                        vr_error: '',
                        va_error: '',
                        vr_ok: '',
                        va_ok: '',
                        validated: false,
                        validated_text: '',
                    })
                }
            })
    }

    async getTestVoltage() {
        wizardServices.getTestVoltage().then(result => {
            if (result.success) {
                console.log(result)
                this.setState({
                    test_voltage: result.data.test_voltage
                })
            }
            else {
                console.log(result)
                this.setState({
                    errors: result.data
                })
            }
        })

    }
}


export default Step5;