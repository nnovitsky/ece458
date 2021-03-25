import React from 'react'
import Base from '../generic/Base.js';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Klufe from './Klufe.js';
import './GuidedCal.css'
import GuidedCalServices from "../../api/guidedCalServices.js";

const guidedCalServices = new GuidedCalServices();

const sourceData = {
    0: {
        source: 3.500,
        AC: false,
        freq: 0,
        display: "3.500+-0.001",
        adjustment: "R21",
    },
    1: {
        source: 3.513,
        AC: true,
        freq: 50,
        display: "3.500+-0.002",
        adjustment: "R34",
    },
    2: {
        source: 100,
        AC: true,
        freq: 20000,
        display: "100.0+-0.2",
        adjustment: "C37",
    },
    3: {
        source: 3.500,
        AC: true,
        freq: 10000,
        display: "3.50.0+-0.004",
        adjustment: "C2",
    },
    4: {
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
            klufePK: this.props.klufePK,
            validDisplay: false,
            functionSet: false,
            klufe: {
                connected: true,
                outputOn: false,
                mode: "DC",
                freq: 0,
                voltage: 0,
            },
            sucessfulSet: false,
            displayVoltage: '',
            // Use to toggle between different steps!!
            index: this.props.index,
            sourceData: sourceData[this.props.index],
            forceDisable: false,
        }

        this.getStatus = this.getStatus.bind(this);
        this.onSetSourceClicked = this.onSetSourceClicked.bind(this);
        this.onTextInput = this.onTextInput.bind(this);
        this.prevCal = this.prevCal.bind(this);
        this.nextCal = this.nextCal.bind(this);
        this.onSetFunction = this.onSetFunction.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.turnOffSource = this.turnOffSource.bind(this);
        this.turnOnSource = this.turnOnSource.bind(this);
    }


    async componentDidMount() {
        await this.getStatus(this.props.index)
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
                disableContinue={(this.state.index === 0 && !this.state.functionSet) || !this.state.validDisplay}
                decrementStep={this.prevCal}
                continueButtonText={this.state.index === 4 ? "Submit Final Step and Finish Calibration" : "Continue"}
                progress={this.props.progress + Math.round((this.state.index - 1) / 7 * 100)}
            />
        );
    }


    makeBody() {
        let extraIndexZeroStep = <Form.Group className={(this.state.sucessfulSet && this.state.validDisplay) ? "form-inline" : "form-inline disabled"}>
            <Form.Label className="col-sm-6 col-form-label">3. Set the Model 87 to the V~ function</Form.Label>
            <Form.Check id="set_function" label="Check when completed" checked={this.state.functionSet} onChange={this.onSetFunction} disabled={!this.state.sucessfulSet || !this.state.validDisplay || this.state.forceDisable}></Form.Check>
        </Form.Group>

        return <div>
            <Form className="guidedCal">
                <h3>Calibration: {this.state.sourceData.source}V at {this.getHzString(this.state.sourceData.freq)}</h3>
                <h7>Follow the steps in order to set up your instrument for the guided calibration.
                <br></br>Once you complete a step, the next step will become enabled.</h7>
                <div className="row">
                    <div className="col">
                        <Form.Group className="form-inline" style={{ marginTop: "20px" }}>
                            <Form.Label className="col-sm-6 col-form-label">1. Set the source for VAC = {this.state.sourceData.source}V at {this.getHzString(this.state.sourceData.freq)}</Form.Label>
                            <Button onClick={this.onSetSourceClicked} disabled={this.state.forceDisable}>Click to set source</Button>
                        </Form.Group>
                        <Form.Group className={this.state.sucessfulSet ? "form-inline" : "form-inline disabled"}>
                            <Form.Label className="col-sm-6 col-form-label">2. Enter the displayed voltage on the Model 87</Form.Label>
                            <Form.Control disabled={!this.state.sucessfulSet || this.state.forceDisable} type="text" value={this.state.displayVoltage} onChange={this.onTextInput} />
                            <Form.Label className="col-sm-11 col-form-label subtext">The Model 87 should now display {this.state.sourceData.display}. If necessary, adjust {this.state.sourceData.adjustment} to obtain the propper display</Form.Label>
                        </Form.Group>
                        {this.state.index === 0 ? extraIndexZeroStep : null}
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
        // set it then turn it on
        guidedCalServices.setSource(this.state.index).then(result => {
            if(result.success)
            {
                console.log(result.data.SSH_success)
                this.setState({
                    klufe: {
                        ...this.state.klufe,
                        connected: true,
                        outputOn: false,
                        mode: this.state.sourceData.AC ? "AC" : "DC",
                        freq: this.state.sourceData.freq,
                        voltage: this.state.sourceData.source,
                    },
                })
                this.turnOnSource();
            }
        })


        this.setState({
            sucessfulSet: !this.state.sucessfulSet,
        })
    }

    onTextInput(e) {
        let val = Number(e.target.value);
         this.setState({
            displayVoltage: e.target.value,
            validDisplay: false,
        })
        if(!isNaN(val)) 
        {
        guidedCalServices.validateMultimeterDisplay(this.state.klufePK, Number(this.state.index), val).then(result =>{
            if(result.success){
                this.setState({
                    errors: [],
                    validDisplay: true,
                })
                this.turnOffSource();
            }
            else{
                this.setState({
                    errors: [`Adjust ${this.state.sourceData.adjustment}: ` + result.data[0]]
                })
            }
        })
    }
    else{
        this.setState({
            errors: ["Invald Input: Your input is not a number, please review your inputted voltage try again"]
        })
    }

        // if input validated need to turn off source
    }

    async turnOffSource(){
        guidedCalServices.turnOffSource().then(result => {
            if(result.success)
            {
                console.log(result.data.SSH_success)
                this.setState({
                    klufe: {
                        ...this.state.Klufe,
                        outputOn: false,
                    }
                })
            }
        })
    }

    async turnOnSource(){
        guidedCalServices.turnOnSource().then(result => {
            if(result.success)
            {   
                console.log(result.data.SSH_success)
                if(result.data.connected[0])
                {
                    this.setState({
                        sucessfulSet: true,
                        klufe: {
                            ...this.state.klufe,
                            connected: true,
                            outputOn: true,
                        },

                    })
                }
            } else {
                this.setState({
                        sucessfulSet: false,
                })
            }
        })
    }

    async onSetFunction() {
        this.setState({
            functionSet: !this.state.functionSet,
        })
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
                forceDisable: false,
            })
            this.getStatus(newIndex);
        }
        else if (this.state.index === 4) {
            this.props.incrementStep();
        }
    }


    prevCal() {
        let currentIndex = this.state.index;
        if (currentIndex > 0) {
            let newIndex = currentIndex - 1;
            this.setState({
                index: newIndex,
                errors: [],
                sourceData: sourceData[newIndex],
            })
            this.getStatus(newIndex);
        }
        else if (this.state.index === 0) {
            this.props.decrementStep()
        }
    }

    async getStatus(newIndex){
        if(this.state.klufePK !== null)
        {
            guidedCalServices.getKlufeCalDetails(this.state.klufePK).then(result => {
                if (result.success) {
                    result.data.voltage_tests.forEach(element =>{
                        if(element.index === newIndex && element.voltage_okay)
                        {
                            console.log("Element matches with index " + element.index)
                            this.setState({
                                sucessfulSet: true,
                                displayVoltage: element.reported_voltage,
                                validDisplay: true,
                                functionSet: true,
                                forceDisable: true
                            })
                        }
                    })
                }
            })
        }
    }

    getHzString(hz) {
        const mega = 1000000
        const kilo = 1000

        if (hz >= mega) {
            return hz / mega + "MHz"
        }
        else if (hz >= kilo) {
            return hz / kilo + "kHz"
        }
        else {
            return hz + "Hz"
        }
    }


}

export default Step2;