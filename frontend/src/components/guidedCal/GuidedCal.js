import React from 'react'
import DeletePopup from '../generic/GenericPopup';
import Step0 from './Step0.js'
import Step1 from './Step1.js'
import Step2 from './Step2.js'
import Step3 from './Step3.js'
import Summary from './Summary.js'
import GuidedCalServices from "../../api/guidedCalServices.js";

const guidedCalServices = new GuidedCalServices();



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
            username: this.props.user.username,
            userPK: this.props.user.pk,
            klufePK: null,
            calEventPK: null,
            klufe: null,
        }

        this.incrementStep = this.incrementStep.bind(this);
        this.decrementStep = this.decrementStep.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onDeleteClicked = this.onDeleteClicked.bind(this);
        this.onDeleteSubmit = this.onDeleteSubmit.bind(this);
        this.onDeleteClose = this.onDeleteClose.bind(this);
        this.setEventPKs = this.setEventPKs.bind(this);
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
                    asset_tag={this.state.asset_tag} user={this.props.user} setEventPKs={this.setEventPKs} klufePK={this.state.klufePK} calEventPK={this.state.calEventPK} progress={0}/>;
            case 1:
                return <Step1 isShown={this.props.isShown} onClose={this.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep}
                    klufePK={this.state.klufePK} progress={Math.round(1/7 * 100)}/>;
/*             case 2:
                return <Step2 isShown={this.props.isShown} onClose={this.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep}
                    klufePK={this.state.klufePK} progress={Math.round(2/7 * 100)}/> */
            case 2:
                return <Step3 isShown={this.props.isShown} onClose={this.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep}
                    klufePK={this.state.klufePK} index={0} progress={Math.round(3/7 * 100)}/>
            default:
                return <Summary isShown={this.props.isShown} onClose={this.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep}
                    klufePK={this.state.klufePK} serial_number={this.state.serial_number} asset_tag={this.state.asset_tag} username={this.props.username}/>

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
        console.log("here")
        if(this.state.klufePK !== null && this.state.currentStep < 3) {
            this.onDeleteClicked();
        }
        else {
            console.log("Didn't need to cancel an event")
            this.props.onClose();
        }
    }

    async cancelEvent() {
            guidedCalServices.deleteKlufeCal(this.state.klufePK).then(result =>{
                console.log(result)
                if(result.success){
                    console.log("deleted event")
                    this.setState({
                        klufePk: null,
                        cal_event_pk: null,
                    })
                    this.props.onClose()
                }
                else{
                    this.setState({
                        errors: result.data
                    })
                }
            })

    }

    async setEventPKs(klufePK, calEventPK){
        this.setState({
            klufePK: klufePK,
            calEventPK: calEventPK
        })
    }
}


export default GuidedCal;