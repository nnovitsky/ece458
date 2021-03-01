import React from 'react'
import Base from './Base.js';
import Form from 'react-bootstrap/Form';
import './Wizard.css'



class Step2 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: [],
            checked: false
        }

        this.toggleCheck = this.toggleCheck.bind(this);

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
                <h2>Perform Visual Inspection of Resistors</h2>
                <br></br>
                <h4>Check Box When Completed</h4>
                <Form.Check onChange={this.toggleCheck} checked={this.state.checked}></Form.Check>
            </Form>

        </div>
    }

    toggleCheck(e) {
        this.setState({
            checked: !this.state.checked
        })

    }

}


export default Step2;