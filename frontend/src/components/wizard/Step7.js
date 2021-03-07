import React from 'react'
import Base from './Base.js';
import Form from 'react-bootstrap/Form';
import './Wizard.css'
import Table from 'react-bootstrap/Table';
import Accordion from 'react-bootstrap/Accordion'
import WizardServices from "../../api/wizardServices.js";
import AccordionTableCard from './AccordionTableCard.js'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const wizardServices = new WizardServices();


class Step3 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: [],
            calInfo: {
                engineer: '',
                date: '',
                voltmeter: '',
                shuntmeter: '',
                comment: ''
            },
            loadbank_pk: this.props.loadbank_pk,
            data: [[],[],[],[]]
        }
        this.getDeatils = this.getDeatils.bind(this);
        this.getData = this.getData.bind(this);

    }

    async componentDidMount() {
        this.getDeatils();
        this.getData().then(res => {
            console.log(this.state.data)
        })
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
                continueButtonText='Finish'
            />
        );
    }

    makeBody() {
        return <div>
            <Form className="wizard">
                <h3>Overview of Calibration Event</h3>
                <Row>
                    <Col>
                        <Table style={{ width: 500 }} responsive bordered>
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
                    </Col>
                    <Col>
                        <Table style={{ width: 500 }} responsive bordered>
                            <tbody>
                                <tr>
                                    <td><strong>Comment</strong></td>
                                    <td>{this.state.calInfo.comment}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                <Accordion>
                    <AccordionTableCard eventKey="0" title={"First Stage"} tableHeader={"Results for initial levels"} data={this.state.data[0]}></AccordionTableCard>
                    <AccordionTableCard eventKey="1" title={"Second Stage"} tableHeader={"Results for secondary levels"} data={this.state.data[1]}></AccordionTableCard>
                    <AccordionTableCard eventKey="2" title={"Third Stage"} tableHeader={"Results for tertiary levels"} data={this.state.data[2]}></AccordionTableCard>
                    <AccordionTableCard eventKey="3" title={"Fourth Stage"} tableHeader={"Results for quaternary levels"} data={this.state.data[3]}></AccordionTableCard>
                </Accordion>
            </Form>
        </div>
    }

    async getDeatils() {
        wizardServices.getDetails(this.state.loadbank_pk).then(result => {
            if (result.success) {
                console.log(result.data)
                this.setState({
                    calInfo: {
                        ...this.state.calInfo,
                        engineer: result.data.cal_event.user.username,
                        date: result.data.cal_event.date,
                        voltmeter: result.data.voltmeter_vendor + " " + result.data.voltmeter_model_num + ", (" + result.data.voltmeter_asset_tag+")",
                        shuntmeter: result.data.shunt_meter_vendor + " " + result.data.shunt_meter_model_num + ", (" + result.data.shunt_meter_asset_tag+")",
                        comment: result.data.cal_event.comment,
                    }
                })
            }
        })
    }

    async getData()
    {
        this.state.data.forEach(element => {
            let index = this.state.data.indexOf(element) + 1
            wizardServices.getLoadLevelSet(this.state.loadbank_pk, index).then(result =>{
                if(result.success)
                {
                    element = result.data
                }
                let newData = this.state.data;
                newData[index-1] = element;
                this.setState({ data: newData});
            })
        })

    }

}


export default Step3;