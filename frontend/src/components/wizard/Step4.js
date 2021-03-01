import React from 'react'
import Base from './Base.js';
import Form from 'react-bootstrap/Form';
import './Wizard.css'
import LoadTable from './LoadTable.js'
import data from './LoadLevel.json'
import Button from 'react-bootstrap/Button';



class Step4 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: [],
            index: props.index,
            initialData: data[props.index],
            validationData: data[props.index], 
        }

        this.updateTable = this.updateTable.bind(this);
        this.validate = this.validate.bind(this);
        this.nextTable = this.nextTable.bind(this);

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
                incrementStep={this.nextTable}
                decrementStep={this.props.decrementStep}
            />
        );
    }

    makeBody() {
        return <div>
            <Form>
                <h3>Turn on load steps and check values</h3>
                <p>Some body</p>
            </Form>
            <LoadTable onValidate={this.validate} data={this.state.initialData} updateTable={this.updateTable}></LoadTable>

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
        this.state.validationData.forEach(el =>{
                if(el.load_level === load_level)
                {
                    // try to validate that one
                    console.log("Validate LL = " + load_level + " cr = " + el.cr + " ca = " + el.ca)
                    if(typeof(el.cr) !== 'undefined' && typeof(el.ca) !== 'undefined')
                    {
                        el.validate = true
                        res.validate = true
                    }
                    else{
                        this.setState({
                            errors: ["On or more inputs are undefined"]
                        })
                    }
                }
            })
            this.setState({
                validationData: this.state.validationData
            })
            return res
    }


    updateTable(data)
    {
        this.setState({
            validationData: data[this.state.index]
        })
    }

    nextTable()
    {
        if(this.state.index < 4)
        {
            this.setState({
                index: this.state.index + 1,
                initialData: data[this.state.index + 1],
                validationData: data[this.state.index + 1], 
            })
        }
        else if(this.state.index === 4)
        {
            this.props.incrementStep()
        }
    }

}


export default Step4;