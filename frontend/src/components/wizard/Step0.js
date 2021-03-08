import React from 'react'
import Base from './Base.js';
import Form from 'react-bootstrap/Form';
import DatePicker from 'react-datepicker';
import { dateToString } from '../generic/Util';
import "react-datepicker/dist/react-datepicker.css";
import WizardServices from "../../api/wizardServices.js";
import AuthServices from '../../api/authServices';
const authServices = new AuthServices();
const wizardServices = new WizardServices();

const dateDetails = "T00:00:00";
class Step0 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: [],
            calInfo: {
                vendor: this.props.vendor,
                model_number: this.props.model_number,
                serial_number: this.props.serial_number,
                asset_tag: this.props.asset_tag,
                engineer: '',
                date_string: dateToString(new Date()),
                date_object: new Date(),
                instrument_pk: this.props.instrument_pk,
                comment: '',
                cal_event_pk: this.props.cal_event_pk,
                loadbank_pk: this.props.loadbank_pk,
            },
        }

        this.onCommentInput = this.onCommentInput.bind(this);
        this.createNewLoadbankEvent = this.createNewLoadbankEvent.bind(this);
        this.onDateChange = this.onDateChange.bind(this);
        this.getUser = this.getUser.bind(this);
        this.getDetails = this.getDetails.bind(this);

    }

    async componentDidMount() {
        this.getUser();
        this.getDetails();
    }


    render() {
        let body = this.makeBody();
        return (
            <Base
                isShown={this.props.isShown}
                errors={this.state.errors}
                onClose={this.props.onClose}
                body={body}
                incrementStep={this.createNewLoadbankEvent}
                decrementStep={this.props.decrementStep}
            />
        );
    }

    makeBody() {
        return <div>
            <Form className="wizard">
                <h3>Calibration Info</h3>
                <p>Please select a date and add a comment for this calibration event. <br></br>Next, click continue to begin the Loadbank Calibration.</p>
                <Form.Group className="form-inline">
                    <Form.Label className="col-sm-3 col-form-label">Vendor:</Form.Label>
                    <Form.Control readOnly="readonly" type="text" value={this.state.calInfo.vendor} />
                    <Form.Label className="col-sm-3 col-form-label">Model Number:</Form.Label>
                    <Form.Control readOnly="readonly" type="text" value={this.state.calInfo.model_number} />
                </Form.Group>
                <Form.Group className="form-inline">
                    <Form.Label className="col-sm-3 col-form-label">Serial Number:</Form.Label>
                    <Form.Control readOnly="readonly" type="text" value={this.state.calInfo.serial_number} />
                    <Form.Label className="col-sm-3 col-form-label">Asset Tag:</Form.Label>
                    <Form.Control readOnly="readonly" type="text" value={this.state.calInfo.asset_tag} />
                </Form.Group>
                <Form.Group className="form-inline">
                    <Form.Label className="col-sm-3 col-form-label">Engineer:</Form.Label>
                    <Form.Control readOnly="readonly" type="text" value={this.state.calInfo.engineer}/>
                    <Form.Label className="col-sm-3 col-form-label">Select a Date:</Form.Label>
                    <DatePicker className="datepicker" onSelect={this.onDateChange} selected={this.state.calInfo.date_object} />
                </Form.Group>
                <Form.Group className="form-inline">
                    <Form.Label className="col-sm-3 col-form-label">Comment:</Form.Label>
                    <Form.Control className="col-sm-7" as="textarea" type="text" value={this.state.calInfo.comment} onChange={this.onCommentInput}/>
                </Form.Group>
            </Form>

        </div>
    }

    onDateChange(e){
        this.setState({
            calInfo: {
                ...this.state.calInfo,
                date_string: dateToString(e),
                date_object: e
            }
        })
    }


    onCommentInput(e) {
        this.setState({
            calInfo: {
                ...this.state.calInfo,
                comment: e.target.value
            }
        })
    }

    async createNewLoadbankEvent(){
        wizardServices.createLoadbankCalEvent(this.state.calInfo.instrument_pk, this.state.calInfo.date_string, this.state.calInfo.cal_event_pk, this.state.calInfo.comment).then(result => {
            if(result.success){
                console.log("Created event " + result.data.loadbank_calibration.pk)
                this.props.setLBNum(result.data.loadbank_calibration.pk)
                this.props.setCalEventPk(result.data.loadbank_calibration.cal_event_pk)
                this.props.incrementStep()
                if(this.state.calInfo.loadbank_pk === null || this.state.calInfo.cal_event_pk === null)
                {
                    console.log("here")
                    this.setState({
                        calInfo: {
                            ...this.state.calInfo,
                            cal_event_pk: result.data.loadbank_calibration.cal_event_pk,
                            loadbank_pk: result.data.loadbank_calibration.pk,
                        }
                    })
                }
            }
            else{
                if(result.data.date) {
                        this.setState({
                            errors: result.data.date
                    })
                }
                else if(result.data.non_field_errors){
                    this.setState({
                        errors: result.data.non_field_errors
                    })
                }
                else if(result.data.calibration_event_error){
                    this.setState({
                        errors: result.data.calibration_event_error
                    })
                }
                else{
                    this.setState({
                        errors: ["Instrument: " + result.data.instrument[0]]
                    })
                }
            }
        })
    }

    async getUser(){
        authServices.getCurrentUser().then((result) => {
            if (result.success) {
              this.setState({
                calInfo: {
                    ...this.state.calInfo,
                    engineer: result.data.username,
                }
              })
            } else {
              localStorage.removeItem('token');
            }
          })
    }

    async getDetails()
    {
        if(this.state.calInfo.loadbank_pk !== null)
        {
            console.log("Here get details")
            wizardServices.getDetails(this.state.calInfo.loadbank_pk).then(result => {
                if(result.success)
                {
                    console.log(result.data.data.cal_event.date)
                    this.setState({
                        calInfo: {
                            ...this.state.calInfo,
                            comment: result.data.data.cal_event.comment,
                            date_object: new Date(result.data.data.cal_event.date + dateDetails),
                            date_string: result.data.data.cal_event.date,
                        }
                    })
                }
            })
        }
    }
}


export default Step0;