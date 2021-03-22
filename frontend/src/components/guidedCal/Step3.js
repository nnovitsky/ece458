import React from 'react'
import Base from '../generic/Base.js';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Klufe from './Klufe.js';
import './GuidedCal.css'

const sourceData = {
    1 : {
        source: 3.513,
        AC: true,
        freq: 50,
        display: "3.500+-0.002",
        adjustment: "R34",
    },
    2 : {
        source: 100,
        AC: true,
        freq: 20000,
        display: "100.0+-0.2",
        adjustment: "C37",
    },
    3 : {
        source: 3.500,
        AC: true,
        freq: 10000,
        display: "3.50.0+-0.004",
        adjustment: "C2",
    },
    4 : {
        source: 35.00,
        AC: true,
        freq: 10000,
        display: "35.00+-0.04",
        adjustment: "C3",
    }
}

class Step2 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: [],
            pk: this.props.pk,
            validDisplay: false,
            klufe: {
                connected: true,
                outputOn: true,
                mode: "AC",
                freq: "75",
                voltage: "10.000",
            },
            sucessfulSet: false,
            displayVoltage: null,
            // Use to toggle between different steps!!
            index: props.index,
            sourceData: sourceData[props.index],
        }

        //this.getStatus = this.getStatus.bind(this);
        this.onSetSourceClicked = this.onSetSourceClicked.bind(this);
        this.onTextInput = this.onTextInput.bind(this);
        this.prevCal = this.prevCal.bind(this);
        this.nextCal = this.nextCal.bind(this);
    }


    async componentDidMount() {
        //await this.getStatus()
        await this.setState({
            sourceData: sourceData[this.state.index]
        })
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
                incrementStep={this.nextCal}
                disableContinue={!this.state.validDisplay}
                decrementStep={this.prevCal}
                continueButtonText={this.state.index === 4 ? "Submit Final Step and Finish Calibration" : "Continue"}
                progress={this.props.progress + Math.round((this.state.index-1)/7*100)}
            />
        );
    }


    makeBody() {
        return <div>
            <Form className="guidedCal">
                <h3>Calibration: {this.state.sourceData.source}V at {this.getHzString(this.state.sourceData.freq)}</h3>
                <h7>Follow the steps in order to set up your instrument for the guided calibration.
                <br></br>Once you complete a step, the next step will become enabled.</h7>
                <div className="row">
                    <div className="col">
                        <Form.Group className="form-inline" style={{ marginTop: "20px" }}>
                            <Form.Label className="col-sm-6 col-form-label">1. Set the source for VAC = {this.state.sourceData.source}V at {this.getHzString(this.state.sourceData.freq)}</Form.Label>
                            <Button onClick={this.onSetSourceClicked}>Click to set source</Button>
                        </Form.Group>
                        <Form.Group className={this.state.sucessfulSet ? "form-inline" : "form-inline disabled"}>
                            <Form.Label className="col-sm-6 col-form-label">2. Enter the displayed voltage on the Model 87</Form.Label>
                            <Form.Control disabled={!this.state.sucessfulSet} type="text" value={this.state.displayVoltage} onChange={this.onTextInput} />
                            <Form.Label className="col-sm-11 col-form-label subtext">The Model 87 should now display {this.state.sourceData.display}. If necessary, adjust {this.state.sourceData.adjustment} to obtain the propper display</Form.Label>
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
        this.setState({
            displayVoltage: val,
            validDisplay: true,
        })

        // if input validated need to turn off source
    }


    nextCal() {
        let currentIndex = this.state.index;
        if (currentIndex < 4) {
            let newIndex = currentIndex + 1;
            this.setState({
                index: newIndex,
                errors: [],
                sourceData: sourceData[newIndex],
                validDisplay: false,
                sucessfulSet: false,
                displayVoltage: '',
            })
        }
        else if (this.state.index === 4) {
            this.props.incrementStep();
        }
    }


    prevCal() {
        console.log("here")
        let currentIndex = this.state.index;
        if (currentIndex > 1) {
            let newIndex = currentIndex - 1;
            this.setState({
                index: newIndex,
                errors: [],
                sourceData: sourceData[newIndex],
            })
        }
        else if (this.state.index === 1) {
            this.props.decrementStep()
        }
    }

    getHzString(hz)
    {
        const mega = 1000000
        const kilo = 1000

        if(hz >= mega){
            return hz/mega + "MHz"
        }
        else if(hz >= kilo){
            return hz/kilo + "kHz"
        }
        else {
            return hz + "Hz"
        }
    }


}

export default Step2;