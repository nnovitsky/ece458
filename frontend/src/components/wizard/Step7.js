import React from 'react'
import Base from './Base.js';
import Form from 'react-bootstrap/Form';
import './Wizard.css'
import Table from 'react-bootstrap/Table';


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
            </Form>

        </div>
    }


}


export default Step3;