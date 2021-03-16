import React from 'react'
import Base from './Base.js';
import Form from 'react-bootstrap/Form';
import './Wizard.css'
import WizardServices from "../../api/wizardServices.js";

const wizardServices = new WizardServices();


const key = "visual_inspection"

class Step2 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: [],
            checked: false,
            loadbank_pk: this.props.loadbank_pk
        }

        this.toggleCheck = this.toggleCheck.bind(this);
        this.getStatus = this.getStatus.bind(this);

    }

    async componentDidMount() {
        await this.getStatus()
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
                disableContinue={!this.state.checked}
            />
        );
    }

    makeBody() {
        return <div>
            <Form className="wizard" style={{textAlign: "center"}}>
                <h5 style={{textAlign: "left"}} >Check when completed:</h5>
                <br></br>
                <Form.Check id="visual_inspection_check" label="Perform Visual Inspection of Resistors" type="checkbox" onChange={this.toggleCheck} checked={this.state.checked}></Form.Check>
            </Form>

        </div>
    }

    toggleCheck(e) {
        wizardServices.updateLBCal(key, !this.state.checked, this.state.loadbank_pk).then(result => {
            if(result.success)
            {
                console.log("Visual inspection set to " + result.data.data.visual_inspection)
                this.setState({
                    checked: !this.state.checked,
                })
            } else {
                this.setState({
                    checked: !this.state.checked,
                    errors: ["Error sending information"]
                })
            }
        })
    }

    async getStatus()
    {
        wizardServices.getDetails(this.state.loadbank_pk).then(result => {
            if (result.success) {
                this.setState({
                    checked: result.data.data.visual_inspection
                })
            }
        })
    }
}


export default Step2;