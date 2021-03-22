import React from 'react'
import Base from '../generic/Base.js';
import Form from 'react-bootstrap/Form';
import './Wizard.css'
import WizardServices from "../../api/wizardServices.js";

const wizardServices = new WizardServices();


const checkCutoff = "checkCutoff"
const checkAlarm = "checkAlarm"
const checkRecordedData = "checkRecordedData"
const checkPrinter = "checkPrinter"

class Step6 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: [],
            allChecked: false,
            checkCutoff: false,
            checkAlarm: false,
            checkRecordedData: false,
            checkPrinter: false,
            loadbank_pk: this.props.loadbank_pk,
        }
        this.toggleCheck = this.toggleCheck.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.getStatus = this.getStatus.bind(this);

    }

    async componentDidMount() {
        await this.getStatus();
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
                incrementStep={this.onSubmit}
                decrementStep={this.props.decrementStep}
                disableContinue={!(this.state.checkCutoff && this.state.checkAlarm && this.state.checkRecordedData && this.state.checkPrinter)}
                continueButtonText="Submit Final Step and Finish Calibration Event"
                progress={this.props.progress}
            />
        );
    }

    makeBody() {
        return <div>
            <Form className="wizard" style={{ textAlign: "center" }}>
                <h3>Final Functional Checks</h3>
                <br></br>
                <h5>Lower DC source voltage and check auto-shut off when voltage is less than 43V</h5>
                <h7>Check Box When Completed</h7>
                <Form.Check onChange={this.toggleCheck} checked={this.state.checkCutoff} name={checkCutoff}></Form.Check>
                <br></br>
                <h5>Lift cell voltage lead and confirm buzzer sounds</h5>
                <h7>Check Box When Completed</h7>
                <Form.Check onChange={this.toggleCheck} checked={this.state.checkAlarm} name={checkAlarm}></Form.Check>
                <br></br>
                <h5>Verify load bank's recorded data on computer</h5>
                <h7>Check Box When Completed</h7>
                <Form.Check onChange={this.toggleCheck} checked={this.state.checkRecordedData} name={checkRecordedData}></Form.Check>
                <br></br>
                <h5>Verify printer works</h5>
                <h7>Check Box When Completed</h7>
                <Form.Check onChange={this.toggleCheck} checked={this.state.checkPrinter} name={checkPrinter}></Form.Check>
                <br></br>
            </Form>

        </div>
    }

    toggleCheck(e) {
        console.log()
        let newCheckValue = ''
        let key = ''

        switch (e.target.name) {
            case checkCutoff:
                newCheckValue = !this.state.checkCutoff
                key = "auto_cutoff"
                this.updateLBCal(key, newCheckValue)
                this.setState({
                    checkCutoff: newCheckValue,
                })
                return;
            case checkAlarm:
                newCheckValue = !this.state.checkAlarm
                key = "alarm"
                this.updateLBCal(key, newCheckValue)
                this.setState({
                    checkAlarm: newCheckValue,
                })
                return;
            case checkRecordedData:
                newCheckValue = !this.state.checkRecordedData
                key = "recorded_data"
                this.updateLBCal(key, newCheckValue)
                this.setState({
                    checkRecordedData: newCheckValue,
                })
                return;
            case checkPrinter:
                newCheckValue = !this.state.checkPrinter
                key = "printer"
                this.updateLBCal(key, newCheckValue)
                this.setState({
                    checkPrinter: newCheckValue,
                })
                return;
            default:
                return;
        }

    }

    async onSubmit() {
        // do something .then
        this.props.incrementStep()
    }

    async updateLBCal(key, value) {
        wizardServices.updateLBCal(key, value, this.state.loadbank_pk).then(result => {
            if (result.success) {
                this.setState({
                    errors: []
                })
            } else {
                this.setState({
                    errors: ["Error sending information"]
                })
            }
        })
    }

    async getStatus() {
        wizardServices.getDetails(this.state.loadbank_pk).then(result => {
            if (result.success) {
                console.log(result.data)
                this.setState({
                    checkCutoff: result.data.data.auto_cutoff,
                    checkAlarm: result.data.data.alarm,
                    checkRecordedData: result.data.data.recorded_data,
                    checkPrinter: result.data.data.printer,
                })
            }
        })
    }
}


export default Step6;