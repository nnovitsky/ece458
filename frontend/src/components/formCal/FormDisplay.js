import React from 'react'
import GenericPopup from '../generic/GenericPopup';
import FormData from './Form.json'
import Form from 'react-bootstrap/Form';
import FormCalServices from "../../api/formCalServices";
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import SimpleTable from './SimpleTable.js'
import Table from 'react-bootstrap/Table';
import Base from '../generic/Base.js';

const formCalServices = new FormCalServices();

class FormDisplay extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            data: [],
            comment: '',
            cal_event_pk: '',
            text_inputs: [],
            numeric_inputs: [],
            bool_inputs: [],
            engineer: '',
            date: '',
            approval_status: '',
        }

        this.getSubmittedForm = this.getSubmittedForm.bind(this);
        this.fillTables = this.fillTables.bind(this);
    }

    async componentDidMount() {
        await this.getSubmittedForm();
    }

    render() {
        let body = this.makeBody();
        return (
            <Base
                title="Form Calibration"
                isShown={this.props.isShown}
                errors={this.state.errors}
                onClose={this.props.onClose}
                body={body}
                incrementStep={this.props.onClose}
                isBackHidden={true}
                decrementStep={() => { }}
                isCancelHidden={true}
                continueButtonText="Exit"
                progressBarHidden={true} />

        );
    }

    makeBody() {
        let formItems = this.makeForm();
        let introItems = this.makeIntro();
        console.log(this.state.data)
        return <div>
            <Form>
                {introItems}
                {formItems}
            </Form>
        </div>
    }

    makeIntro() {
        return <div>
            <Table style={{ width: 500 }} responsive bordered>
                <tbody>
                    <tr>
                        <td><strong>Engineer</strong></td>
                        <td>{this.state.engineer}</td>
                    </tr>
                    <tr>
                        <td><strong>Date</strong></td>
                        <td>{this.state.date}</td>
                    </tr>
                    <tr>
                        <td><strong>Comment</strong></td>
                        <td>{this.state.comment}</td>
                    </tr>
                    <tr>
                        <td><strong>Approval Status</strong></td>
                        <td>{this.state.approval_status}</td>
                    </tr>
                </tbody>
            </Table>
        </div>
    }

    fillTables(fields) {
        let numeric_input = [];
        let text_input = [];
        let bool_input = [];
        for (let i = 0; i < fields.length; i++) {
            let group;
            let formField = fields[i];
            switch (formField.fieldtype) {
                case "TEXT_INPUT":
                    group = {
                        label: formField.label,
                        value: formField.actual_text
                    };
                    text_input.push(group);
                    break;
                case "FLOAT_INPUT":
                    group = {
                        label: formField.label,
                        value: formField.actual_float
                    };
                    numeric_input.push(group);
                    break;
                case "BOOL_INPUT":
                    group = {
                        label: formField.label,
                        value: formField.actual_bool
                    };
                    bool_input.push(group);
                    break;
                default:
                    break;
            }
        }
        this.setState({
            numeric_inputs: numeric_input,
            text_inputs: text_input,
            bool_inputs: bool_input,
        })
    }

    makeForm() {
        return <Accordion>
            <Card>
                <Accordion.Toggle as={Card.Header} eventKey={1}>
                    Text Inputs
                </Accordion.Toggle>
                <Accordion.Collapse eventKey={1}>
                    <Card.Body>
                        <SimpleTable data={this.state.text_inputs}> </SimpleTable>
                    </Card.Body>
                </Accordion.Collapse>
            </Card>
            <Card>
                <Accordion.Toggle as={Card.Header} eventKey={2}>
                    Numeric Inputs
                </Accordion.Toggle>
                <Accordion.Collapse eventKey={2}>
                    <Card.Body>
                        <SimpleTable data={this.state.numeric_inputs}> </SimpleTable>
                    </Card.Body>
                </Accordion.Collapse>
            </Card>
            <Card>
                <Accordion.Toggle as={Card.Header} eventKey={3}>
                    Check Box Inputs
                </Accordion.Toggle>
                <Accordion.Collapse eventKey={3}>
                    <Card.Body>
                        <SimpleTable data={this.state.bool_inputs}> </SimpleTable>
                    </Card.Body>
                </Accordion.Collapse>
            </Card>
        </Accordion>
    }


    async getSubmittedForm() {
        formCalServices.viewFormSubmission(56430)
            .then((result) => {
                console.log(result.data)
                if (result.success) {
                    this.setState({
                        data: result.data.fields,
                        engineer: result.data.cal_event.user.username,
                        date: result.data.cal_event.date,
                        comment: result.data.cal_event.comment,
                        approval_status: result.data.cal_event.approval_status,
                    })
                    this.fillTables(result.data.fields);
                } else {
                    console.log("Failed")
                }
            })
    }

}

export default FormDisplay;
