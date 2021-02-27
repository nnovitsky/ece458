import React from 'react'
import Base from './Base.js';
import Form from 'react-bootstrap/Form';
import './Wizard.css'



class Step2 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: [],
        }

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
            <Form className="wizard" style={{textAlign: "center"}}>
                <h2>Perform Visual Inspection of Resistors</h2>
                <br></br>
                <h4>Check Box When Completed</h4>
                <Form.Check></Form.Check>
            </Form>

        </div>
    }

}


export default Step2;