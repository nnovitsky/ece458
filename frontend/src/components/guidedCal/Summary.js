import React from 'react'
import Base from '../generic/Base.js';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import GuidedCalServices from "../../api/guidedCalServices.js";
import DisplayTable from './DisplayTable.js';
import { hasCalibrationAccess } from '../generic/Util';

const guidedCalServices = new GuidedCalServices();

class Summary extends React.Component {

    constructor(props) { 
        super(props)
        this.state = {
            klufePK: this.props.klufePK,
            calInfo: {
                engineer: '',
                date: '',
                instrument: '',
                comment: '',
                voltageData: [],
            },
            errors: [],
            canDelete: false,
        }
        this.getKlufeDetails = this.getKlufeDetails.bind(this);
        this.onClose = this.onClose.bind(this);
    }

    async componentDidMount()
    {
        window.sessionStorage.removeItem("klufe");
        window.sessionStorage.removeItem("klufepk");
        await this.getKlufeDetails();
    }

    render() {
        let body = this.makeBody();
        return (
            <Base
                title="Guided Calibration"
                isShown={this.props.isShown}
                errors={this.state.errors}
                onClose={this.onClose}
                body={body}
                incrementStep={this.onClose}
                isBackHidden={!this.state.canDelete || !hasCalibrationAccess(this.props.currentUser.permissions_groups)}
                decrementStep={this.props.cancelEvent}
                backButtonText='Delete'
                isCancelHidden={true}
                continueButtonText="Exit"
                progressBarHidden={true}
            />
        );
    }

    makeBody() {
        return <div>
                <Form>
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
                                    <td><strong>Instrument</strong></td>
                                    <td>{this.state.calInfo.instrument}</td>
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
                <DisplayTable data={this.state.calInfo.voltageData}/> 
            </Form>
        </div>
    }


    async getKlufeDetails()
    {
        guidedCalServices.getKlufeCalDetails(this.state.klufePK).then(result => {
            if(result.success)
            {
                this.setState({
                    calInfo: {
                        ...this.state.calInfo,
                        engineer: result.data.cal_event.user.username,
                        date: result.data.cal_event.date,
                        instrument: result.data.cal_event.instrument.item_model.model_number + " (" +result.data.cal_event.instrument.asset_tag + ")",
                        comment: result.data.cal_event.comment,
                        voltageData: result.data.voltage_tests,
                    },
                })
                if(result.errors.missing_tests.length !== 0 ||  result.errors.failed_tests.length !== 0)
                {
                    this.setState({
                        errors: ["Error: Engineer has not yet completed this calibration event or failed to cancel it."],
                        canDelete: true,
                    })
                } 
            }
            else{
                this.setState({
                    errors: result.data
                })
            }
        })
    }

    onClose()
    {
        window.sessionStorage.removeItem("klufe");
        window.sessionStorage.removeItem("klufepk");
        this.props.onClose();
    }


}

export default Summary;
