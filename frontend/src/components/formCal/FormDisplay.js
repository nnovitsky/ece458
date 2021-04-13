import React from 'react'
import GenericPopup from '../generic/GenericPopup';
import FormData from './Form.json'
import Form from 'react-bootstrap/Form';
import FormCalServices from "../../api/formCalServices";
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import SimpleTable from './SimpleTable.js'
import Table from 'react-bootstrap/Table';

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
            engineer: '',
            date: '',
        }

        this.getCalEvent = this.getCalEvent.bind(this);
        this.fillTables = this.fillTables.bind(this);
    }

    async componentDidMount() {
        //await this.getCalEvent();
        this.setState({
            data: FormData.data
        })
        this.fillTables(FormData.data);
    }

    render() {
        let body = this.makeBody();
        return (
            <GenericPopup
                show={this.props.isShown}
                body={body}
                headerText="Form Calibration"
                closeButtonText="Exit"
                onClose={this.props.onClose}
                submitButtonVariant="primary"
                errors={this.state.errors}
                isSubmitButtonShown={false}
                keyboard={false}
                backdrop="static"
            />
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
                </tbody>
            </Table>
        </div>
    }

    fillTables(fields) {
        let numeric_input = [];
        let text_input = [];
        for (let i = 0; i < fields.length; i++) {
            let group;
            let formField = fields[i];
            switch (formField.type) {
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
                default:
                    break;
            }
        }
        this.setState({
            numeric_inputs: numeric_input,
            text_inputs: text_input,
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
        </Accordion>
    }


    async getCalEvent() {
        formCalServices.getExistingForm(this.state.cal_event_pk)
            .then((result) => {
                console.log(result.data)
                if (result.success) {
                    this.setState({
                        data: []
                    })
                } else {
                    console.log("Failed")
                }
            })
    }

}

export default FormDisplay;
