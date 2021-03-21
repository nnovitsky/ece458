import React from 'react'
import Base from '../generic/Base.js';
import Form from 'react-bootstrap/Form';
import DatePicker from 'react-datepicker';
import { dateToString } from '../generic/Util';
import "react-datepicker/dist/react-datepicker.css";


class Step0 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: [],
            pk: this.props.pk,
            calInfo: {
                vendor: this.props.vendor,
                model_number: this.props.model_number,
                serial_number: this.props.serial_number,
                asset_tag: this.props.asset_tag,
                date_string: dateToString(new Date()),
                date_object: new Date(),
                instrument_pk: this.props.instrument_pk,
                pk: this.props.pk,
            },
        }

        this.onDateChange = this.onDateChange.bind(this);

    }

    async componentDidMount() {
        //await this.getStatus()
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
                incrementStep={this.props.incrementStep}
                decrementStep={this.props.decrementStep}
                
            />
        );
    }

    makeBody() {
        return <div>
            <Form className="guidedCal" style={{textAlign: "Left"}}>
            <h3>Calibration Info</h3>
                <p>Please select a date for this calibration event. <br></br>Next, click continue to begin the Guided Calibration.</p>
                <Form.Group className="form-inline">
                    <Form.Label className="col-sm-3 col-form-label">Vendor:</Form.Label>
                    <Form.Control readOnly="readonly" type="text" value={this.state.calInfo.vendor} />
                    <Form.Label className="col-sm-3 col-form-label">Model Number:</Form.Label>
                    <Form.Control readOnly="readonly" type="text" value={this.state.calInfo.model_number} />
                </Form.Group>
                <Form.Group className="form-inline">
                    <Form.Label className="col-sm-3 col-form-label">Serial Number:</Form.Label>
                    <Form.Control readOnly="readonly" type="text" value={this.state.calInfo.serial_number === '' || this.state.calInfo.serial_number === null ? "N/A" : this.state.calInfo.serial_number} />
                    <Form.Label className="col-sm-3 col-form-label">Asset Tag:</Form.Label>
                    <Form.Control readOnly="readonly" type="text" value={this.state.calInfo.asset_tag} />
                </Form.Group>
                <Form.Group className="form-inline">
                    <Form.Label className="col-sm-3 col-form-label">Engineer:</Form.Label>
                    <Form.Control readOnly="readonly" type="text" value={this.props.username}/>
                    <Form.Label className="col-sm-3 col-form-label">Select a Date:</Form.Label>
                    <DatePicker className="datepicker" onSelect={this.onDateChange} selected={this.state.calInfo.date_object} maxDate={new Date()}/>
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

    // async createNewGuidedCalEvent()
    // createEvent.then(connect to ssh)

/*     async getStatus()
    {
        wizardServices.getDetails(this.state.loadbank_pk).then(result => {
            if (result.success) {
                this.setState({
                    checked: result.data.data.visual_inspection
                })
            }
        })
    } */
}


export default Step0;