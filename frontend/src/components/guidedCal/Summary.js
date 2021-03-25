import React from 'react'
import Base from '../generic/Base.js';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import GuidedCalServices from "../../api/guidedCalServices.js";

const guidedCalServices = new GuidedCalServices();

class Summary extends React.Component {

    constructor(props) { 
        super(props)
        this.state = {
            klufePK: this.props.klufePK,
            calInfo: {
                engineer: 'Engineer',
                date: 'Date',
                instrument: 'Instrument',
                comment: 'Comment',
            },
            errors: [],
        }
        this.getKlufeDetails = this.getKlufeDetails.bind(this);
    }

    async componentDidMount()
    {
        await this.getKlufeDetails();
    }

    render() {
        let body = this.makeBody();
        return (
            <Base
                title="Guided Calibration"
                isShown={this.props.isShown}
                errors={this.state.errors}
                onClose={this.props.onClose}
                body={body}
                incrementStep={this.props.onClose}
                isBackHidden={true}
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
            </Form>
        </div>
    }


    async getKlufeDetails()
    {
        guidedCalServices.getKlufeCalDetails(this.state.klufePK).then(result => {
            console.log(result)
            if(result.success)
            {
                console.log("Success")
                this.setState({
                    calInfo: {
                        ...this.state.calInfo,
                        engineer: result.data.cal_event.user.username,
                        date: result.data.cal_event.date,
                        instrument: result.data.cal_event.instrument.item_model.model_number + " (" +result.data.cal_event.instrument.asset_tag + ")",
                        comment: result.data.cal_event.comment,
                    },
                })
            }
            else{
                this.setState({
                    errors: result.data
                })
            }
        })
    }


}

export default Summary;
