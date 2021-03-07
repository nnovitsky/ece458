import React from 'react'
import Base from './Base.js';
import Form from 'react-bootstrap/Form';
import './Wizard.css'
import LoadTable from './LoadTable.js'

import WizardServices from "../../api/wizardServices.js";

const wizardServices = new WizardServices();



class Step4 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: [],
            index: props.index,
            validationData: [],
            allValidated: false,
            loadbank_pk: this.props.loadbank_pk,
            num_validated: 0,
        }

        this.updateTable = this.updateTable.bind(this);
        this.updateValidated = this.updateValidated.bind(this);
        this.validate = this.validate.bind(this);
        this.nextTable = this.nextTable.bind(this);
        this.prevTable = this.prevTable.bind(this);
        this.getInitialData = this.getInitialData.bind(this);

    }

    async componentDidMount() {
        await this.getInitialData(this.state.index)
    }


    render() {
        let body = this.makeBody();
        console.log(this.state.num_validated + " vs. " + this.state.validationData.length)

        return (
            <Base
                isShown={this.props.isShown}
                errors={this.state.errors}
                onClose={this.props.onClose}
                body={body}
                incrementStep={this.nextTable}
                decrementStep={this.prevTable}
                //TODO: Add this in once we want all validated
                //disableContinue={!(this.state.num_validated === this.state.validationData.length)}
            />
        );
    }

    makeBody() {
        return <div>
            <Form>
                <h3>Turn on Load Steps and Check Values</h3>
                    Instructions:
                    <ol>
                        <li>Click a cell to enter the current reported (from the display) and the current actual (from the shutmeter) for a load level</li>
                        <li>Press [Enter] after each time you enter input to save your input in the cell</li>
                        <li>Click validate to validate your inputs. If the row appears green, your inputs were acceptable callibration values.</li>
                        <li>Click continue once you have entered and validated all inputs</li>
                    </ol>
                <p>
                    Note: If you change an input, you will be required to revalidate that input
                </p>
            </Form>
            <LoadTable updateValidated={this.updateValidated} onValidate={this.validate} data={this.state.validationData} updateTable={this.updateTable}></LoadTable>

        </div>
    }

    async getInitialData(index)
    {
        wizardServices.getLoadLevelSet(this.state.loadbank_pk, index).then(result =>{
            if(result.success)
            {
                this.setState({
                    validationData: result.data,
                })
                let count = 0;
                result.data.forEach(element => {
                    if(element.ca_ok && element.cr_ok)
                    {
                        count++;
                    }
                })
                this.setState({
                    num_validated: count
                })
            }
        })
    }

    async validate(e) {

        this.setState({
            errors: []
        })

        const load = e.target.value
        let res = {
            validate: false
        }

        this.state.validationData.forEach(element => {
            if (element.load === load) {
                wizardServices.addCurrentReading(element.load, Number(element.cr), Number(element.ca), Number(element.ideal), Number(element.index), this.state.loadbank_pk)
                .then(result => {
                    if(result.success){
                            element.ca_error = result.data.ca_error
                            element.cr_error = result.data.cr_error
                            element.cr_ok = result.data.cr_ok
                            element.ca_ok = result.data.ca_ok
                            element.validate = (result.data.cr_ok && result.data.ca_ok)
                            res.validate = element.validate
                            if(element.validate) this.setState({num_validated: this.state.num_validated+1})
                            this.setState({ validationData: this.state.validationData})
                            if(result.error !== null)
                            {
                                this.setState({
                                    errors: [result.error]
                                })
                            }
                    }
                    else{
                        this.setState({
                            errors: result.error
                        })
                    }
                })
            }
        })

        this.setState({
            validationData: this.state.validationData,
        })
        return res
    }

    updateValidated(val)
    {   
        this.setState({
            num_validated: this.state.num_validated + val
        })
    }

    updateTable(data) {
        this.setState({
            validationData: data
        })
    }

    nextTable() {
        let currentIndex = this.state.index;
        if (currentIndex < 4) {
            this.setState({
                index: currentIndex + 1,
            })
            this.getInitialData((currentIndex+1))
        }
        else if (this.state.index === 4) {
            this.props.incrementStep()
        }
    }


    prevTable() {
        let currentIndex = this.state.index;
        if (currentIndex > 1) {
            this.setState({
                index: currentIndex - 1,
            })
            this.getInitialData((currentIndex-1))
        }
        else if (this.state.index === 1) {
            this.props.decrementStep()
        }
    }

}


export default Step4;