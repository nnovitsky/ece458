import React from 'react'
import Base from '../generic/Base.js';
import Form from 'react-bootstrap/Form';
import './Wizard.css'
import WizardServices from "../../api/wizardServices.js";

const wizardServices = new WizardServices();



class Step3 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: [],
            checked: false,
            loadbank_pk: this.props.loadbank_pk,
        }

        this.toggleCheck = this.toggleCheck.bind(this);

    }
    async componentDidMount() {

        
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
                <h2>Connect to DC Source</h2>
                <br></br>
                <h4>Check Box When Completed</h4>
                <Form.Check onChange={this.toggleCheck} checked={this.state.checked}></Form.Check>
            </Form>

        </div>
    }

    toggleCheck() {
        this.setState({
            checked: !this.state.checked
        })
    }

}


export default Step3;