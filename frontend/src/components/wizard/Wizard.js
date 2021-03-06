import React from 'react'
import Step0 from './Step0.js';
import Step1 from './Step1.js';
import Step2 from './Step2.js';
import Step3 from './Step3.js';
import Step4 from './Step4.js';
import Step5 from './Step5.js';
import Step6 from './Step6.js';
import Step7 from './Step7.js';
import WizardServices from "../../api/wizardServices.js";
import DeletePopup from '../generic/GenericPopup';
const wizardServices = new WizardServices();

class Wizard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            currentStep: 0,
            model_number: this.props.model_number,
            vendor: this.props.vendor,
            serial_number: this.props.serial_number,
            instrument_pk: this.props.instrument_pk,
            loadbank_pk: null,
            asset_tag: this.props.asset_tag,
            cal_event_pk: null,
            isDeleteShown: false,
        }

        this.incrementStep = this.incrementStep.bind(this);
        this.decrementStep = this.decrementStep.bind(this);
        this.setLoabankCalEventNumber = this.setLoabankCalEventNumber.bind(this);
        this.setCalEventPk = this.setCalEventPk.bind(this);
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
                        setLBNum={this.setLoabankCalEventNumber} setCalEventPk={this.setCalEventPk} asset_tag={this.state.asset_tag} cal_event_pk={this.state.cal_event_pk}
                        loadbank_pk={this.state.loadbank_pk}/>;
            case 1:
                return <Step1 isShown={this.props.isShown} onClose={this.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} 
                        loadbank_pk={this.state.loadbank_pk}/>;
            case 2:
                return <Step2 isShown={this.props.isShown} onClose={this.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} 
                        loadbank_pk={this.state.loadbank_pk}/>
            case 3:
                return <Step3 isShown={this.props.isShown} onClose={this.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} 
                        loadbank_pk={this.state.loadbank_pk}/>
            case 4:
                return <Step4 index={1} isShown={this.props.isShown} onClose={this.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} 
                        loadbank_pk={this.state.loadbank_pk}/>
            case 5:
                return <Step5 isShown={this.props.isShown} onClose={this.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} 
                        loadbank_pk={this.state.loadbank_pk}/>
            case 6:
                return <Step6 isShown={this.props.isShown} onClose={this.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} 
                        loadbank_pk={this.state.loadbank_pk}/>
            default:
                return <Step7 isShown={this.props.isShown} onClose={this.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} 
                        loadbank_pk={this.state.loadbank_pk}/>

        }

    }


    makeDeletePopup() {
        let body = (
            <p>Are you sure you want to exit and cancel this loadbank calibration?</p>
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
        // TODO cancelEvent()
        this.props.onClose();
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

    async setLoabankCalEventNumber(lb_pk){
        this.setState({
            loadbank_pk: lb_pk
        })
    }

    async setCalEventPk(cal_pk){
        this.setState({
            cal_event_pk: cal_pk
        })
    }

    async onClose(){
        if(this.state.loadbank_pk !== null)
        {
            this.setState({
                isDeleteShown: true
            })
        }
        else{
            this.props.onClose()
        }
        
    }

    // TODO get this working 
    async cancelEvent()
    {
            wizardServices.cancelLoadbankCalEvent(this.state.loadbank_pk).then(result => {
                console.log(result)
                if(result.success){
                    this.props.onClose()
                }
                else {
                    this.setState({
                        errors: result.data
                    })
                }
            })

    }
}


export default Wizard;