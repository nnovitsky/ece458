import React from 'react'
import Base from './Base.js';
import Form from 'react-bootstrap/Form';
import './Wizard.css'
import Table from 'react-bootstrap/Table';
import Accordion from 'react-bootstrap/Accordion'
import WizardServices from "../../api/wizardServices.js";
import data from './LoadLevel.json'
import AccordionTableCard from './AccordionTableCard.js'

const wizardServices = new WizardServices();


class Step3 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: [],
            calInfo: {
                engineer: 'Bob',
                date: '02/28/2021',
                voltmeter: '33',
                shuntmeter: '56',
            },
            loadbank_pk: this.props.loadbank_pk,
        }


    }


    render() {
        let body = this.makeBody();
        return (
            <Base
                isShown={this.props.isShown}
                errors={this.state.errors}
                onClose={this.props.onClose}
                body={body}
                incrementStep={this.props.onClose}
                decrementStep={this.props.decrementStep}
                isCancelHidden={true}
                isBackHidden={false}
                continueButtonText='Exit'
            />
        );
    }

    makeBody() {
        return <div>
            <Form className="wizard">
                <h3>Overview of Calibration Event</h3>
                <Table size="sm" bordered>
                    {/* <tr className="text-center">
                    <th colSpan={2}>Instrument Information</th>
                </tr> */}
                    <tbody>
                        <tr>
                            <td><strong>Engineer</strong></td>
                            <td>{this.state.calInfo.engineer}</td>
                        </tr>
                        <tr>
                            <td><strong>Date</strong></td>
                            <td>{this.state.calInfo.date}</td>
                        </tr>
                        <tr>
                            <td><strong>Voltmeter Used</strong></td>
                            <td>{this.state.calInfo.voltmeter}</td>
                        </tr>
                        <tr>
                            <td><strong>Shuntmeter Used</strong></td>
                            <td>{this.state.calInfo.shuntmeter}</td>
                        </tr>
                    </tbody>
                </Table>
                <Accordion>
                    <AccordionTableCard eventKey="0" title={"First Stage"} tableHeader={"Results for initial Levels"} data={data[1]}></AccordionTableCard>
                    <AccordionTableCard eventKey="1" title={"Second Stage"} tableHeader={"Results for secondary Levels"} data={data[2]}></AccordionTableCard>
                    <AccordionTableCard eventKey="2" title={"Third Stage"} tableHeader={"Results for tertiary Levels"} data={data[3]}></AccordionTableCard>
                    <AccordionTableCard eventKey="3"title={"Fourth Stage"} tableHeader={"Results for quaternary Levels"} data={data[4]}></AccordionTableCard>
                </Accordion>
            </Form>
        </div>
    }

}


export default Step3;