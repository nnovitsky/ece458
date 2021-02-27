import React from 'react'
import Base from './Base.js';
import Form from 'react-bootstrap/Form';
import './Wizard.css'



class Step4 extends React.Component {

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
            <Form>
                <h1>Step 4</h1>
                <p>Some body</p>
            </Form>

        </div>
    }

}


export default Step4;