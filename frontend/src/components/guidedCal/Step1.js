import React from 'react'
import Base from '../generic/Base.js';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Klufe from './Klufe.js';
import './GuidedCal.css'



class Step1 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: [],
            pk: this.props.pk,
            sucessfulSet: false,
            sucessfulFunction: false,
            sucessfulConnection: false,
            klufe: {
                connected: true,
                outputOn: true,
                mode: "AC",
                freq: "75",
                voltage: "10.000",
            }
        }

        //this.getStatus = this.getStatus.bind(this);
        this.onSetSourceClicked = this.onSetSourceClicked.bind(this);
        this.onCheckMultimeter = this.onCheckMultimeter.bind(this);
        this.onCheckConnection = this.onCheckConnection.bind(this);
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
                disableContinue={!this.state.sucessfulSet || !this.state.sucessfulFunction || !this.state.sucessfulConnection}
                decrementStep={this.props.decrementStep}
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
                        <Form.Group className="form-inline" name="First" style={{ marginTop: "20px" }}>
                            <Form.Label className="col-sm-6 col-form-label">1. Set the source for VDC = 0V</Form.Label>
                            <Button onClick={this.onSetSourceClicked}>Click to set source</Button>
                        </Form.Group>
                        <Form.Group className={this.state.sucessfulSet ? "form-inline" : "form-inline disabled"}>
                            <Form.Label className="col-sm-6 col-form-label">2. On the multimeter, set the V-- function</Form.Label>
                            <Form.Check id="set_function_instrument" label="Check when completed" onChange={this.onCheckMultimeter} checked={this.state.sucessfulFunction} disabled={!this.state.sucessfulSet}></Form.Check>
                        </Form.Group>
                        <Form.Group className={(this.state.sucessfulSet && this.state.sucessfulFunction) ? "form-inline" : "form-inline disabled"}>
                            <Form.Label className="col-sm-6 col-form-label">3. Connect the source to the Model 87 (omega stuff)</Form.Label>
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


    async onSetSourceClicked() {
        this.setState({
            sucessfulSet: !this.state.sucessfulSet,
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


}

export default Step1;