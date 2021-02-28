import React from 'react'
import Base from './Base.js';
import Form from 'react-bootstrap/Form';
import './Wizard.css'


const checkOne = "checkOne"
const checkTwo = "checkTwo"
const checkThree = "checkThree"
const checkFour = "checkFour"

class Step7 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: [],
            allChecked: false,
            checkOne: false,
            checkTwo: false,
            checkThree: false,
            checkFour: false,
        }
        this.toggleCheck = this.toggleCheck.bind(this);

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
                disableContinue={!(this.state.checkOne&&this.state.checkTwo&&this.state.checkThree&&this.state.checkFour)}
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
                <Form.Check onChange={this.toggleCheck} checked={this.state.checkOne} name={checkOne}></Form.Check>
                <br></br>
                <h5>Lift cell voltage lead and confirm buzzer sounds</h5>
                <h7>Check Box When Completed</h7>
                <Form.Check onChange={this.toggleCheck} checked={this.state.checkTwo} name={checkTwo}></Form.Check>
                <br></br>
                <h5>Verify load bank's recorded data on computer</h5>
                <h7>Check Box When Completed</h7>
                <Form.Check onChange={this.toggleCheck} checked={this.state.checkThree} name={checkThree}></Form.Check>
                <br></br>
                <h5>Verify printer works</h5>
                <h7>Check Box When Completed</h7>
                <Form.Check onChange={this.toggleCheck} checked={this.state.checkFour} name={checkFour}></Form.Check>
                <br></br>
            </Form>

        </div>
    }

    toggleCheck(e) {
        console.log()

        switch (e.target.name) {
            case checkOne:
                this.setState({
                    checkOne: !this.state.checkOne,
                })
                return;
            case checkTwo:
                this.setState({
                    checkTwo: !this.state.checkTwo,
                })
                return;
            case checkThree:
                this.setState({
                    checkThree: !this.state.checkThree,
                })
                return;
            case checkFour:
                this.setState({
                    checkFour: !this.state.checkFour,
                })
                return;
            default:
                return;
        }

    }
}


export default Step7;