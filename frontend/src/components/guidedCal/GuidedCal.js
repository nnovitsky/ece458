import React from 'react'
import DeletePopup from '../generic/GenericPopup';
import Step0 from './Step0.js'
import Step1 from './Step1.js'
import Step2 from './Step2.js'
import Step3 from './Step3.js'
import Summary from './Summary.js'



class GuidedCal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            currentStep: 0,
            isDeleteShown: false,
            model_number: this.props.model_number,
            vendor: this.props.vendor,
            serial_number: this.props.serial_number,
            instrument_pk: this.props.instrument_pk,
            asset_tag: this.props.asset_tag,
            username: this.props.username
        }

        this.incrementStep = this.incrementStep.bind(this);
        this.decrementStep = this.decrementStep.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onDeleteClicked = this.onDeleteClicked.bind(this);
        this.onDeleteSubmit = this.onDeleteSubmit.bind(this);
        this.onDeleteClose = this.onDeleteClose.bind(this);
    }

    render() {
        let body = this.makeBody();
        let deleteEventPopup = (this.state.isDeleteShown) ? this.makeDeletePopup() : null;
        return (
                <div>
                    {deleteEventPopup}
                    {body}
                </div>
        );
    }

    makeBody() {
        switch (this.state.currentStep) {
            case 0:
                return <Step0 isShown={this.props.isShown} onClose={this.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep}
                    model_number={this.state.model_number} vendor={this.state.vendor} serial_number={this.state.serial_number} instrument_pk={this.state.instrument_pk}
                    asset_tag={this.state.asset_tag} username={this.props.username} progress={0}/>;
            case 1:
                return <Step1 isShown={this.props.isShown} onClose={this.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep}
                progress={Math.round(1/7 * 100)}/>;
            case 2:
                return <Step2 isShown={this.props.isShown} onClose={this.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep}
                progress={Math.round(2/7 * 100)}/>
            case 3:
                return <Step3 isShown={this.props.isShown} onClose={this.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep}
                        index={1} progress={Math.round(3/7 * 100)}/>
            case 4:
                return <Summary isShown={this.props.isShown} onClose={this.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep}
                    serial_number={this.state.serial_number} asset_tag={this.state.asset_tag} username={this.props.username}/>
            case 5:
                return <div>Step 5</div>
            case 6:
                return <div>Step 6</div>
            default:
                return <div>Step 7</div>

        }

    }


    makeDeletePopup() {
        let body = (
            <p>Are you sure you want to exit and cancel this guided calibration?</p>
        )
        return (
            <DeletePopup
                show={this.state.isDeleteShown}
                body={body}
                headerText="Warning!"
                closeButtonText="Return"
                submitButtonText="Exit"
                onClose={this.onDeleteClose}
                onSubmit={this.onDeleteSubmit}
                submitButtonVariant="danger"
            />
        )
    }

    onDeleteClicked() {
        this.setState({
            isDeleteShown: true
        })
    }

    onDeleteClose() {
        this.setState({
            isDeleteShown: false
        })
    }

    onDeleteSubmit() {
        this.cancelEvent()
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

    async onClose() {
            this.props.onClose()
    }

    async cancelEvent() {
        // Backend call to cancel event

    }
}


export default GuidedCal;