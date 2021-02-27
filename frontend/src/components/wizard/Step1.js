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
                vendor: '',
                model_number: '',
                asset_tag: '',
            },
            shuntmeter: {
                vendor: '',
                model_number: '',
                asset_tag: '',
            }
        }
        this.onTextInput = this.onTextInput.bind(this);
    }


    render() {
        let body = this.makeBody();
        return (
            <Base
                title="Calibration Wizard"
                isShown={this.props.isShown}
                errors={this.state.errors}
                onClose={this.props.onClose}
                body={body}
                incrementStep={this.props.incrementStep}
                decrementStep={this.props.decrementStep}
            />
        );
    }

    makeBody() {
        return <div>
            <Form className="wizard">
                <h3>Calibration Info</h3>
                <h5>Voltmeter:</h5>
                <Form.Group className="form-inline">
                    <Form.Label className="col-sm-1 col-form-label">Vendor:</Form.Label>
                    <Form.Control type="text" name={vmVendor} value={this.state.voltmeter.vendor} onChange={this.onTextInput} />
                    <Form.Label className="col-sm-1 col-form-label">Model Number:</Form.Label>
                    <Form.Control type="text" name={vmModel} value={this.state.voltmeter.model_number} onChange={this.onTextInput} />
                    <Form.Label className="col-sm-1 col-form-label">Asset Tag:</Form.Label>
                    <Form.Control type="text" name={vmAsset} value={this.state.voltmeter.asset_tag} onChange={this.onTextInput} />
                    <Button>Validate</Button>
                </Form.Group>
                <h5>Current Shuntmeter:</h5>
                <Form.Group className="form-inline">
                    <Form.Label className="col-sm-1 col-form-label">Vendor:</Form.Label>
                    <Form.Control type="text" name={shuntVendor} value={this.state.shuntmeter.vendor} onChange={this.onTextInput} />
                    <Form.Label className="col-sm-1 col-form-label">Model Number:</Form.Label>
                    <Form.Control type="text" name={shuntModel} value={this.state.shuntmeter.model_number} onChange={this.onTextInput} />
                    <Form.Label className="col-sm-1 col-form-label">Asset Tag:</Form.Label>
                    <Form.Control type="text" name={shuntAsset} value={this.state.shuntmeter.asset_tag} onChange={this.onTextInput} />
                    <Button>Validate</Button>
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

}


export default Step1;