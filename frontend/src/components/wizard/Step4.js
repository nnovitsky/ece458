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
        this.seeIfAllValidated = this.seeIfAllValidated.bind(this);

    }

    async componentDidMount() {
        await this.getInitialData(this.state.index)
    }


    render() {
        let body = this.makeBody();
        return (
            <Base
                isShown={this.props.isShown}
                errors={this.state.errors}
                onClose={this.props.onClose}
                body={body}
                incrementStep={this.nextTable}
                decrementStep={this.prevTable}
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
                    <b><li>If the row appears green after inputting both values, your inputs were acceptable callibration values and you can continue entering values</li></b>
                    <li>If your inputs were not acceptable, the row will appear red and you should read the error message to change your calibration</li>
                    <li>Click continue once you have entered and validated all inputs</li>
                </ol>
                <p>
                    Note: If you change an input, you will be required to revalidate that input. If you do not revalidate, the old input will be held in the calibration record.
                </p>
            </Form>
            <LoadTable updateValidated={this.updateValidated} onValidate={this.validate} data={this.state.validationData} updateTable={this.updateTable}></LoadTable>

        </div>
    }

    async getInitialData(index) {
        wizardServices.getLoadLevelSet(this.state.loadbank_pk, index).then(result => {
            if (result.success) {
                this.setState({
                    validationData: result.data,
                })
                let count = 0;
                result.data.forEach(element => {
                    if (element.ca_ok && element.cr_ok) {
                        count++;
                    }
                })
                this.setState({
                    num_validated: count
                })
            }
        })
    }

    getStrippedVal(value) {
        let ret = null;
        if (typeof(value) !== 'undefined' && value !== null) {
            let stripped = value.toString().trim();
            if (stripped.length !== 0) {
                ret = Number(value)
            }
        }
        return ret;
    }

    async validate(load, invalidated) {

        this.setState({
            errors: []
        })
        let res = {
            validate: false
        }

        this.state.validationData.forEach(element => {
            if (element.load === load) {
                let cr = this.getStrippedVal(element.cr);
                let ca = this.getStrippedVal(element.ca);

                if (ca !== null && cr !== null || invalidated) {
                    wizardServices.addCurrentReading(element.load, cr, ca, Number(element.ideal), Number(element.index), this.state.loadbank_pk)
                        .then(result => {
                            if (result.success) {
                                element.ca_error = result.data.ca_error
                                element.cr_error = result.data.cr_error
                                element.cr_ok = result.data.cr_ok
                                element.ca_ok = result.data.ca_ok
                                element.validate = (result.data.cr_ok && result.data.ca_ok)
                                res.validate = element.validate
                                if (element.validate) this.setState({ num_validated: this.state.num_validated + 1 })
                                this.setState({ validationData: this.state.validationData })
                                if (result.error !== null) {
                                    this.setState({
                                        errors: [result.error]
                                    })
                                }
                            }
                            else {
                                this.setState({
                                    errors: result.error
                                })
                            }
                        })

                }

            }
        })

        this.setState({
            validationData: this.state.validationData,
        })
        return res
    }

    updateValidated(val) {
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
                errors: [],
            })
            this.getInitialData((currentIndex + 1))
        }
        else if (this.state.index === 4) {
            this.seeIfAllValidated();
        }
    }


    prevTable() {
        let currentIndex = this.state.index;
        if (currentIndex > 1) {
            this.setState({
                index: currentIndex - 1,
                errors: [],
            })
            this.getInitialData((currentIndex - 1))
        }
        else if (this.state.index === 1) {
            this.props.decrementStep()
        }
    }

    async seeIfAllValidated() {
        wizardServices.getDetails(this.state.loadbank_pk).then(result => {
            if (result.success) {
                if (result.data.errors.unacceptable_load_readings.length === 0 && result.data.errors.missing_load_readings.length === 0) {
                    this.props.incrementStep()
                }
                else if (result.data.errors.unacceptable_load_readings.length > 0) {
                    this.setState({
                        errors: ["Cannot continue: Some inputted current readings contain unacceptable values. Please fix and validate them to continue."]
                    })
                }
                else if (result.data.errors.missing_load_readings.length > 0) {
                    this.setState({
                        errors: ["Cannot continue: Some current readings are missing, please enter and validate them to continue."]
                    })
                }
            }
        })
    }

}


export default Step4;