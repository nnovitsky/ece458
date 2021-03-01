import React from 'react'
import Step0 from './Step0.js';
import Step1 from './Step1.js';
import Step2 from './Step2.js';
import Step3 from './Step3.js';
import Step4 from './Step4.js';
import Step5 from './Step5.js';
import Step6 from './Step6.js';
import Step7 from './Step7.js';

class Wizard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            currentStep: 0,
        }

        this.incrementStep = this.incrementStep.bind(this);
        this.decrementStep = this.decrementStep.bind(this);
    }

    render() {
        let body = this.makeBody();
        return (
            <div>
                {body}
            </div>
        );
    }

    makeBody() {
        switch (this.state.currentStep) {
            case 0:
                return <Step0 isShown={this.props.isShown} onClose={this.props.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} />;
            case 1:
                return <Step1 isShown={this.props.isShown} onClose={this.props.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} />;
            case 2:
                return <Step2 isShown={this.props.isShown} onClose={this.props.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} />
            case 3:
                return <Step3 isShown={this.props.isShown} onClose={this.props.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} />
            case 4:
                return <Step4 index={1} isShown={this.props.isShown} onClose={this.props.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} />
            case 5:
                return <Step5 isShown={this.props.isShown} onClose={this.props.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} />
            case 6:
                return <Step6 isShown={this.props.isShown} onClose={this.props.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} />
            default:
                return <Step7 isShown={this.props.isShown} onClose={this.props.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} />

        }

    }

    incrementStep() {
        if (this.state.currentStep < 7) {
            this.setState({
                currentStep: this.state.currentStep + 1,
                errors: []
            })
        }
    }

    decrementStep() {
        if (this.state.currentStep > 0) {
            this.setState({
                currentStep: this.state.currentStep - 1,
                errors: []
            })
        }
    }
}


export default Wizard;