import React from 'react'
import Base from './Base.js';
import Form from 'react-bootstrap/Form';
import './Wizard.css'



class Step7 extends React.Component {

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
            <Form style={{ textAlign: "center" }}>
                <h3>Final Functional Checks</h3>
                <br></br>
                <h5>Lower DC source voltage and check auto-shut off when voltage is less than 43V</h5>
                <h7>Check Box When Completed</h7>
                <Form.Check></Form.Check>
                <br></br>
                <h5>Lift cell voltage lead and confirm buzzer sounds</h5>
                <h7>Check Box When Completed</h7>
                <Form.Check></Form.Check>
                <br></br>
                <h5>Verify load bank's recorded data on computer</h5>
                <h7>Check Box When Completed</h7>
                <Form.Check></Form.Check>
                <br></br>
                <h5>Verify printer works</h5>
                <h7>Check Box When Completed</h7>
                <Form.Check></Form.Check>
                <br></br>
            </Form>

        </div>
    }

}


export default Step7;