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
            model_pk: this.props.model_pk,
            loadbank_pk: null
        }

        this.incrementStep = this.incrementStep.bind(this);
        this.decrementStep = this.decrementStep.bind(this);
        this.setLoabankCalEventNumber = this.setLoabankCalEventNumber.bind(this);
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
                return <Step0 isShown={this.props.isShown} onClose={this.props.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} 
                        model_number={this.state.model_number} vendor={this.state.vendor} serial_number={this.state.serial_number} model_pk={this.state.model_pk}
                        setLBNum={this.setLoabankCalEventNumber}/>;
            case 1:
                return <Step1 isShown={this.props.isShown} onClose={this.props.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} 
                        loadbank_pk={this.state.loadbank_pk}/>;
            case 2:
                return <Step2 isShown={this.props.isShown} onClose={this.props.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} />
            case 3:
                return <Step3 isShown={this.props.isShown} onClose={this.props.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} />
            case 4:
                return <Step4 index={1} isShown={this.props.isShown} onClose={this.props.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} 
                        loadbank_pk={this.state.loadbank_pk}/>
            case 5:
                return <Step5 isShown={this.props.isShown} onClose={this.props.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} 
                        loadbank_pk={this.state.loadbank_pk}/>
            case 6:
                return <Step6 isShown={this.props.isShown} onClose={this.props.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} 
                        loadbank_pk={this.state.loadbank_pk}/>
            default:
                return <Step7 isShown={this.props.isShown} onClose={this.props.onClose} incrementStep={this.incrementStep} decrementStep={this.decrementStep} 
                        loadbank_pk={this.state.loadbank_pk}/>

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

    async setLoabankCalEventNumber(lb_pk){
        this.setState({
            loadbank_pk: lb_pk
        })
    }

    async onCancel(){
        if(this.state.loadbank_pk !== null)
        {
            wizardServices.cancelLoadbankCalEvent(this.state.loadbank_pk).then(result => {
                if(result.success){
                    this.props.onClose()
                }
                else {
                    this.setState({
                        // TODO: fix this!!!
                        errors: result.data
                    })
                }
            })
        }
        
    }
}


export default Wizard;