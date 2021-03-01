import React from 'react'
import Base from './Base.js';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';



const vmVendor = "vmVendor";
const vmModel = "vmModel";
const vmAsset = "vmAsset";
const shuntVendor = "shuntVendor";
const shuntModel = "shuntModel";
const shuntAsset = "shuntAsset";


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
            }
        }
        this.onTextInput = this.onTextInput.bind(this);
        this.continue = this.continue.bind(this);
        this.validateVoltmeter = this.validateVoltmeter.bind(this);
        this.validateShuntmeter = this.validateShuntmeter.bind(this);
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
                <p>For each device, enter all fields then validate to continue.</p>
                <h5>Voltmeter: {this.state.voltmeter.validated_text}</h5>
                <Form.Group className="form-inline">
                    <Form.Label className="col-sm-1 col-form-label">Vendor:</Form.Label>
                    <Form.Control type="text" name={vmVendor} value={this.state.voltmeter.vendor} onChange={this.onTextInput} />
                    <Form.Label className="col-sm-1 col-form-label">Model Number:</Form.Label>
                    <Form.Control type="text" name={vmModel} value={this.state.voltmeter.model_number} onChange={this.onTextInput} />
                    <Form.Label className="col-sm-1 col-form-label">Asset Tag:</Form.Label>
                    <Form.Control type="text" name={vmAsset} value={this.state.voltmeter.asset_tag} onChange={this.onTextInput} />
                    <Button onClick={this.validateVoltmeter}>Validate</Button>
                </Form.Group>
                <h5>Current Shuntmeter: {this.state.shuntmeter.validated_text}</h5>
                <Form.Group className="form-inline">
                    <Form.Label className="col-sm-1 col-form-label">Vendor:</Form.Label>
                    <Form.Control type="text" name={shuntVendor} value={this.state.shuntmeter.vendor} onChange={this.onTextInput} />
                    <Form.Label className="col-sm-1 col-form-label">Model Number:</Form.Label>
                    <Form.Control type="text" name={shuntModel} value={this.state.shuntmeter.model_number} onChange={this.onTextInput} />
                    <Form.Label className="col-sm-1 col-form-label">Asset Tag:</Form.Label>
                    <Form.Control type="text" name={shuntAsset} value={this.state.shuntmeter.asset_tag} onChange={this.onTextInput} />
                    <Button onClick={this.validateShuntmeter}>Validate</Button>
                </Form.Group>
            </Form>

        </div>
    }

    onTextInput(e) {
        let val = e.target.value;
        switch (e.target.name) {
            case vmVendor:
                this.setState({
                    voltmeter: {
                        ...this.state.voltmeter,
                        vendor: val
                    }
                })
                return;
            case vmModel:
                this.setState({
                    voltmeter: {
                        ...this.state.voltmeter,
                        model_number: val
                    }
                })
                return;
            case vmAsset:
                this.setState({
                    voltmeter: {
                        ...this.state.voltmeter,
                        asset_tag: val
                    }
                })
                return;
            case shuntVendor:
                this.setState({
                    shuntmeter: {
                        ...this.state.shuntmeter,
                        vendor: val
                    }
                })
                return
            case shuntModel:
                this.setState({
                    shuntmeter: {
                        ...this.state.shuntmeter,
                        model_number: val
                    }
                })
                return
            case shuntAsset:
                this.setState({
                    shuntmeter: {
                        ...this.state.shuntmeter,
                        asset_tag: val
                    }
                })
                return
            default:
                return;
        }
    }

    async validateVoltmeter()
    {
        if(this.state.voltmeter.vendor === '')
        {
            this.setState({
                errors: ["Voltmeter vendor empty"],
                voltmeter: {
                    validated: false,
                    validated_text: 'Invalid',
                }
            })
        }
        else 
        {
            this.setState({
                errors: [],
                voltmeter: {
                    validated: true,
                    validated_text: 'Valid',
                }
            })
        }
    }


    async validateShuntmeter()
    {
        if(this.state.shuntmeter.vendor === '')
        {
            this.setState({
                errors: ["Shuntmeter vendor empty"],
                shuntmeter: {
                    validated: false,
                    validated_text: 'Invalid',
                }
            })
        }
        else 
        {
            this.setState({
                errors: [],
                shuntmeter: {
                    validated: true,
                    validated_text: 'Valid',
                }
            })
        }
    }








    async continue()
    {
        console.log(this.state.calInfo)
        if(this.state.voltmeter.validated === true && this.state.shuntmeter.validated === true )
        {
            this.setState({
                errors: []
            })
        }
        else
        {
            this.props.incrementStep();
            this.setState({
                errors: ["Voltmeter vendor empty"]
            })
        }

    }

}


export default Step1;