import React from 'react'
import Base from './Base.js';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import WizardServices from "../../api/wizardServices.js";

const wizardServices = new WizardServices();


const vmAsset = "vmAsset";
const shuntAsset = "shuntAsset";
const shuntmeter = "shuntmeter"
const voltmeter = "voltmeter"


class Step1 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: [],
            voltmeter: {
                validated: false,
                validated_text: '',
                vendor: '',
                model_number: '',
                asset_tag: '',
            },
            shuntmeter: {
                validated: false,
                validated_text: '',
                vendor: '',
                model_number: '',
                asset_tag: '',
            },
            loadbank_pk: this.props.loadbank_pk,
        }
        this.onTextInput = this.onTextInput.bind(this);
        this.validateVoltmeter = this.validateVoltmeter.bind(this);
        this.validateShuntmeter = this.validateShuntmeter.bind(this);
        this.getDetails = this.getDetails.bind(this);
    }


    async componentDidMount() {
        //TODO this.getDetails();
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
                disableContinue={!(this.state.voltmeter.validated && this.state.shuntmeter.validated)}
                decrementStep={this.props.decrementStep}
            />
        );
    }

    makeBody() {
        return <div>
            <Form className="wizard">
                <h3>Calibration Info</h3>
                <p>For each device, please enter the Asset Tag. The Vendor and Model Number will be autofilled for each instrument.
                    <br></br>Validate both instruments to continue.</p>
                <h5>Voltmeter: {this.state.voltmeter.validated_text}</h5>
                <Form.Group className="form-inline">
                    <Form.Label className="col-sm-1 col-form-label">Asset Tag:</Form.Label>
                    <Form.Control type="text" name={vmAsset} value={this.state.voltmeter.asset_tag} onChange={this.onTextInput} />
                    <Form.Label className="col-sm-1 col-form-label">Vendor:</Form.Label>
                    <Form.Control readOnly="readonly" type="text" value={this.state.voltmeter.vendor} />
                    <Form.Label className="col-sm-1 col-form-label">Model Number:</Form.Label>
                    <Form.Control readOnly="readonly" type="text" value={this.state.voltmeter.model_number} />
                    <Button onClick={this.validateVoltmeter}>Validate</Button>
                </Form.Group>
                <h5>Current Shuntmeter: {this.state.shuntmeter.validated_text}</h5>
                <Form.Group className="form-inline">
                    <Form.Label className="col-sm-1 col-form-label">Asset Tag:</Form.Label>
                    <Form.Control type="text" name={shuntAsset} value={this.state.shuntmeter.asset_tag} onChange={this.onTextInput} />
                    <Form.Label className="col-sm-1 col-form-label">Vendor:</Form.Label>
                    <Form.Control readOnly="readonly" type="text" value={this.state.shuntmeter.vendor} />
                    <Form.Label className="col-sm-1 col-form-label">Model Number:</Form.Label>
                    <Form.Control readOnly="readonly" type="text" value={this.state.shuntmeter.model_number} />
                    <Button onClick={this.validateShuntmeter}>Validate</Button>
                </Form.Group>
            </Form>

        </div>
    }

    onTextInput(e) {
        let val = e.target.value;
        switch (e.target.name) {
            case vmAsset:
                this.setState({
                    voltmeter: {
                        ...this.state.voltmeter,
                        asset_tag: val,
                        validated: false,
                        validated_text: '',
                        vendor: '',
                        model_number: ''
                    }
                })
                return
            case shuntAsset:
                this.setState({
                    shuntmeter: {
                        ...this.state.shuntmeter,
                        asset_tag: val,
                        validated: false,
                        validated_text: '',
                        vendor: '',
                        model_number: ''
                    }
                })
                return
            default:
                return;
        }
    }

    async validateVoltmeter() {
        wizardServices.updateLBCal(voltmeter, this.state.voltmeter.asset_tag, this.state.loadbank_pk)
            .then(result => {
                if (result.success) {
                    this.setState({
                        errors: [],
                        voltmeter: {
                            ...this.state.voltmeter,
                            validated: true,
                            validated_text: 'Valid',
                            vendor: result.data.data.voltmeter_vendor,
                            model_number: result.data.data.voltmeter_model_num
                        }
                    })
                }
                else {
                    this.setState({
                        errors: ["Voltmeter: " + result.data.loadbank_error],
                        voltmeter: {
                            ...this.state.voltmeter,
                            validated: false,
                            validated_text: 'Invalid',
                            vendor: '',
                            model_number: ''
                        }
                    })

                }
            })
    }


    async validateShuntmeter() {
        wizardServices.updateLBCal(shuntmeter, this.state.shuntmeter.asset_tag, this.state.loadbank_pk)
            .then(result => {
                if (result.success) {
                    this.setState({
                        errors: [],
                        shuntmeter: {
                            ...this.state.shuntmeter,
                            validated: true,
                            validated_text: 'Valid',
                            vendor: result.data.data.shunt_meter_vendor,
                            model_number: result.data.data.shunt_meter_model_num
                        }
                    })
                }
                else {
                    this.setState({
                        errors: ["Shuntmeter: " + result.data.loadbank_error],
                        shuntmeter: {
                            ...this.state.shuntmeter,
                            shuntmeter: false,
                            validated_text: 'Invalid',
                            vendor: '',
                            model_number: ''
                        }
                    })

                }
            })
    }

    async getDetails()
    {
        if(this.state.loadbank_pk !== null)
        {
            wizardServices.getDetails(this.state.loadbank_pk).then(result => {
                if(result.success)
                {
                    this.setState({
                        // setstuff here???
                    })
                }
            })
        }
    }

}


export default Step1;