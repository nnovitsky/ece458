import React from 'react'
import Base from '../generic/Base.js';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Klufe from './Klufe.js';
import './GuidedCal.css'
import GuidedCalServices from "../../api/guidedCalServices.js";
import InstrumentServices from "../../api/instrumentServices.js";

const guidedCalServices = new GuidedCalServices();
const instrumentServices = new InstrumentServices();



class Step1 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: [],
            klufePK: this.props.klufePK,
            sucessfulSet: false,
            sucessfulFunction: false,
            sucessfulConnection: false,
            klufe: {
                connected: false,
                outputOn: null,
                mode: "",
                freq: "",
                voltage: "",
            },
            validKlufeMeter: false,
            klufeAssetTag: '',
            instrumentPK: this.props.instrumentPK,
        }

        //this.getStatus = this.getStatus.bind(this);
        this.onSetSourceClicked = this.onSetSourceClicked.bind(this);
        this.onCheckMultimeter = this.onCheckMultimeter.bind(this);
        this.onCheckConnection = this.onCheckConnection.bind(this);
        this.onTextInput = this.onTextInput.bind(this);
    }


    async componentDidMount() {
        //await this.getStatus()
    }


    render() {
        let body = this.makeBody();
        return (
            <Base
                title="Guided Calibration"
                isShown={this.props.isShown}
                errors={this.state.errors}
                onClose={this.props.onClose}
                body={body}
                incrementStep={this.props.incrementStep}
                disableContinue={!this.state.validKlufeMeter || !this.state.sucessfulSet || !this.state.sucessfulFunction || !this.state.sucessfulConnection}
                decrementStep={this.props.decrementStep}
                progress={this.props.progress}
            />
        );
    }


    makeBody() {
        return <div>
            <Form className="guidedCal">
                <h3>Setup</h3>
                <h7>Follow the steps in order to set up your instrument for the guided calibration.
                <br></br>Once you complete a step, the next step will become enabled.</h7>
                <div className="row">
                    <div className="col">
                        <Form.Group className="form-inline" style={{ marginTop: "20px" }}>
                            <Form.Label className="col-sm-6 col-form-label">1. Asset tag of Klufe Instrument to use</Form.Label>
                            <Form.Control className={this.state.validKlufeMeter ? "validated" : null} value={this.state.klufeAssetTag} onChange={this.onTextInput} ></Form.Control>
                        </Form.Group>
                        <Form.Group className="form-inline" name="First">
                            <Form.Label className="col-sm-6 col-form-label">2. Set the source for VDC = 0V</Form.Label>
                            <Button disabled={!this.state.validKlufeMeter} onClick={this.onSetSourceClicked}>Click to set source</Button>
                        </Form.Group>
                        <Form.Group className={this.state.sucessfulSet ? "form-inline" : "form-inline disabled"}>
                            <Form.Label className="col-sm-6 col-form-label">3. On the multimeter, set the V⎓ function</Form.Label>
                            <Form.Check id="set_function_instrument" label="Check when completed" onChange={this.onCheckMultimeter} checked={this.state.sucessfulFunction} disabled={!this.state.sucessfulSet}></Form.Check>
                        </Form.Group>
                        <Form.Group className={(this.state.sucessfulSet && this.state.sucessfulFunction) ? "form-inline" : "form-inline disabled"}>
                            <Form.Label className="col-sm-6 col-form-label">4. Connect the source to the Model 87 VΩ⏄ and COM inputs</Form.Label>
                            <Form.Check id="connect_instrument" label="Check when completed" onChange={this.onCheckConnection} disabled={!this.state.sucessfulSet || !this.state.sucessfulFunction}></Form.Check>
                        </Form.Group>
                    </div>
                    <div className="col" style={{ marginTop: "20px" }}>
                        <Klufe connected={this.state.klufe.connected} outputOn={this.state.klufe.outputOn}
                            mode={this.state.klufe.mode} freq={this.state.klufe.freq} voltage={this.state.klufe.voltage} />
                    </div>
                </div>
            </Form>

        </div>
    }

    onTextInput(e) {
        let val = e.target.value;
        this.setState({
            klufeAssetTag: val
        })

        instrumentServices.validateCalibratorInstrument(this.state.instrumentPK, Number(val))
        .then(result =>{
            if(result.success)
            {
                if(result.data.is_valid === true){
                    this.setState({
                        validKlufeMeter: true,
                        errors: [],
                    })
                } else {   
                    this.setState({
                        validKlufeMeter: false,
                        errors: [result.data.calibration_errors[0]],
                    })
                }
            }
            console.log(result)
        })
    }


    async onSetSourceClicked() {
        guidedCalServices.connectSSH().then(result => {
            console.log(result)
            if (result.success) {
                console.log(result.data.SSH_success)
                this.setState({
                    sucessfulSet: true,
                    klufe: {
                        ...this.state.klufe,
                        connected: true,
                        mode: "DC",
                        freq: "0Hz",
                        voltage: 0,
                    },
                })
                this.turnOffSource();
            }
        })
    }

    async onCheckMultimeter() {
        this.setState({
            sucessfulFunction: !this.state.sucessfulFunction,
        })
    }

    async onCheckConnection() {
        this.setState({
            sucessfulConnection: !this.state.sucessfulConnection,
        })
    }

    async validateKlufeMeter() {

    }

    async turnOffSource() {
        guidedCalServices.turnOffSource().then(result => {
            if (result.success) {
                console.log(result.data.SSH_success)
                this.setState({
                    klufe: {
                        ...this.state.klufe,
                        outputOn: false,
                    }
                })
            }
        })
    }


}

export default Step1;