import React from 'react'
import Base from '../generic/Base.js';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Klufe from './Klufe.js';
import './GuidedCal.css'



class Step2 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: [],
            pk: this.props.pk,
            sucessfulSet: false,
            sucessfulFunction: false,
            validDisplay: false,
            klufe: {
                connected: true,
                outputOn: true,
                mode: "AC",
                freq: "75",
                voltage: "10.000",
            },
            displayVoltage: null,
        }

        //this.getStatus = this.getStatus.bind(this);
        this.onSetSourceClicked = this.onSetSourceClicked.bind(this);
        this.onTextInput = this.onTextInput.bind(this);
        this.onSetFunction = this.onSetFunction.bind(this);
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
                disableContinue={!this.state.sucessfulFunction}
                decrementStep={this.props.decrementStep}
            />
        );
    }


    makeBody() {
        return <div>
            <Form className="guidedCal">
                <h3>Calibration</h3>
                <h7>Follow the steps in order to set up your instrument for the guided calibration.
                <br></br>Once you complete a step, the next step will become enabled.</h7>
                <div className="row">
                    <div className="col">
                        <Form.Group className="form-inline" style={{ marginTop: "20px" }}>
                            <Form.Label className="col-sm-6 col-form-label">1. Set the source for VDC = 3.500V</Form.Label>
                            <Button onClick={this.onSetSourceClicked}>Click to set source</Button>
                        </Form.Group>
                        <Form.Group className={this.state.sucessfulSet ? "form-inline" : "form-inline disabled"}>
                            <Form.Label className="col-sm-6 col-form-label">2. Enter the displayed voltage on the Model 87</Form.Label>
                            <Form.Control disabled={!this.state.sucessfulSet} type="text" value={this.state.displayVoltage} onChange={this.onTextInput} />
                            <Form.Label className="col-sm-11 col-form-label subtext">The Model 87 should now display 3.500+-0.001. If necessary, adjust R21 to obtain the propper display</Form.Label>
                        </Form.Group>
                        <Form.Group className={(this.state.sucessfulSet && this.state.validDisplay) ? "form-inline" : "form-inline disabled"}>
                            <Form.Label className="col-sm-6 col-form-label">3. Set the Model 87 to the V~ function</Form.Label>
                            <Form.Check id="set_function" label="Check when completed" onChange={this.onSetFunction} disabled={!this.state.sucessfulSet || !this.state.validDisplay}></Form.Check>
                        </Form.Group>
                    </div>
                    <div className="col">
                        <Klufe connected={this.state.klufe.connected} outputOn={this.state.klufe.outputOn}
                            mode={this.state.klufe.mode} freq={this.state.klufe.freq} voltage={this.state.klufe.voltage} />
                    </div>
                </div>
            </Form>

        </div>
    }


    async onSetSourceClicked() {
        this.setState({
            sucessfulSet: !this.state.sucessfulSet,
        })
    }

    onTextInput(e) {
        let val = e.target.value;
        console.log("On text input")
        this.setState({
            displayVoltage: val,
            validDisplay: true,
        })
        // if input validated need to turn off source

    }

    async onSetFunction() {
        this.setState({
            sucessfulFunction: !this.state.sucessfulFunction,
        })
    }


}

export default Step2;