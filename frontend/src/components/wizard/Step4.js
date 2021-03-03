import React from 'react'
import Base from './Base.js';
import Form from 'react-bootstrap/Form';
import './Wizard.css'
import LoadTable from './LoadTable.js'
import data from './LoadLevel.json'

import WizardServices from "../../api/wizardServices.js";

const wizardServices = new WizardServices();



class Step4 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: [],
            index: props.index,
            initialData: data[props.index],
            validationData: data[props.index],
            allValidated: false,
            loadbank_pk: this.props.loadbank_pk,
            num_validated: 0,
        }

        this.updateTable = this.updateTable.bind(this);
        this.updateAllValidated = this.updateAllValidated.bind(this);
        this.validate = this.validate.bind(this);
        this.nextTable = this.nextTable.bind(this);

    }

    render() {
        let body = this.makeBody();
        //console.log(this.state.num_validated)
        //console.log(this.state.validationData.length)

        return (
            <Base
                isShown={this.props.isShown}
                errors={this.state.errors}
                onClose={this.props.onClose}
                body={body}
                incrementStep={this.nextTable}
                decrementStep={this.props.decrementStep}
                //Add this in once we want all validated
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
            <LoadTable updateAllValidated={this.updateAllValidated} onValidate={this.validate} data={this.state.initialData} updateTable={this.updateTable}></LoadTable>

        </div>
    }

    async validate(e) {

        this.setState({
            errors: []
        })

        const load_level = e.target.value
        let res = {
            validate: false
        }

        this.state.validationData.forEach(element => {
            if (element.load_level === load_level) {
                wizardServices.addCurrentReading(element.load_level, Number(element.cr), Number(element.ca), Number(element.ideal_current), Number(element.index), this.state.loadbank_pk)
                .then(result => {
                    if(result.success){
                            element.ca_error = result.data.ca_error.toFixed(3) * 100 + "%"
                            element.cr_error = result.data.cr_error.toFixed(3) * 100 + "%"
                            element.cr_ok = result.data.cr_ok ? "Yes" : "No"
                            element.ca_ok = result.data.ca_ok ? "Yes" : "No"
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

    updateAllValidated(val)
    {   
        this.setState({
            num_validated: this.state.num_validated + val
        })
    }

    updateTable(data) {
        this.setState({
            validationData: data[this.state.index]
        })
    }

    nextTable() {
        if (this.state.index < 4) {
            this.setState({
                index: this.state.index + 1,
                initialData: data[this.state.index + 1],
                validationData: data[this.state.index + 1],
                allValidated: false
            })
        }
        else if (this.state.index === 4) {
            this.props.incrementStep()
        }
    }

}


export default Step4;