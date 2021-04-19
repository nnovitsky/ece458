import React from 'react'
import Base from '../generic/Base.js';
import Form from 'react-bootstrap/Form';
import DatePicker from 'react-datepicker';
import { dateToString } from '../generic/Util';
import GuidedCalServices from "../../api/guidedCalServices.js";
import InstrumentServices from "../../api/instrumentServices.js";
import "react-datepicker/dist/react-datepicker.css";

const guidedCalServices = new GuidedCalServices();
const instrumentServices = new InstrumentServices();
const dateDetails = "T00:00:00";

class Step0 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: [],
            klufePK: this.props.klufePK,
            cal_event_pk: this.props.calEventPk,
            calInfo: {
                vendor: this.props.vendor,
                model_number: this.props.model_number,
                serial_number: this.props.serial_number,
                asset_tag: this.props.asset_tag,
                date_string: dateToString(new Date()),
                date_object: new Date(),
                instrument_pk: this.props.instrument_pk,
                comment: '',
                klufeAssetTag: '',
                calibrated_with: [],
            },
            validKlufeMeter: false,
            klufeInputDisabled: false,
            user: this.props.user
        }

        this.onDateChange = this.onDateChange.bind(this);
        this.createKlufeCal = this.createKlufeCal.bind(this);
        this.onCommentInput = this.onCommentInput.bind(this);
        this.onTextInput = this.onTextInput.bind(this);
        this.getAssetTag = this.getAssetTag.bind(this);
        this.getStatus = this.getStatus.bind(this);

    }

    async componentDidMount() {
        await this.getStatus()
    }


    render() {
        console.log(this.state.calInfo.klufeAssetTag)
        let body = this.makeBody();
        return (
            <Base
                title="Guided Calibration"
                isShown={this.props.isShown}
                errors={this.state.errors}
                onClose={this.props.onClose}
                body={body}
                incrementStep={this.createKlufeCal}
                decrementStep={this.props.decrementStep}
                progress={this.props.progress}
                disableContinue={!this.state.validKlufeMeter}
                progressBarHidden={true}

            />
        );
    }

    makeBody() {
        return <div>
            <Form className="guidedCal" style={{ textAlign: "Left" }}>
                <h3>Calibration Info</h3>
                <p>First, please input the asset tag of the Klufe instrument used for this calibration. 
                    <br></br>If your tag is valid, the input will turn green.
                    <br></br>Next, select a date for this calibration event. <br></br>Once your input has been validated, click continue to begin the Guided Calibration.</p>
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
                    <Form.Label className="col-sm-3 col-form-label">Klufe Calibrator Asset Tag:</Form.Label>
                    <Form.Control className={this.state.validKlufeMeter && !this.state.klufeInputDisabled ? "validated" : null} disabled={this.state.klufeInputDisabled} value={this.state.calInfo.klufeAssetTag} onChange={this.onTextInput} ></Form.Control>
                    <Form.Label className="col-sm-3 col-form-label">Select a Date:</Form.Label>
                    <DatePicker className="datepicker" onChange={this.onDateChange} selected={this.state.calInfo.date_object} maxDate={new Date()} />
                </Form.Group>
                <Form.Group className="form-inline">
                    <Form.Label className="col-sm-3 col-form-label">Comment:</Form.Label>
                    <Form.Control className="col-sm-7" as="textarea" type="text" value={this.state.calInfo.comment} onChange={this.onCommentInput} />
                </Form.Group>
            </Form>

        </div>
    }

    onDateChange(e) {
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

    onTextInput(e) {
        let val = e.target.value;
        this.setState({
            calInfo: {
                ...this.state.calInfo,
                klufeAssetTag: val
            }
        })

        instrumentServices.validateCalibratorInstrument(this.state.calInfo.instrument_pk, Number(val))
        .then(result =>{
            if(result.success)
            {
                if(result.data.is_valid === true){
                    this.setState({
                        validKlufeMeter: true,
                        calInfo: {
                            ...this.state.calInfo,
                            calibrated_with: result.data.calibrated_by_instruments,
                        },
                        errors: [],
                    })
                } else {   
                    this.setState({
                        validKlufeMeter: false,
                        calInfo: {
                            ...this.state.calInfo,
                            calibrated_with: []
                        },
                        errors: [result.data.calibration_errors[0]],
                    })
                }
            }
            console.log(result)
        })
    }

    async createKlufeCal() {
        if (this.state.klufePK === null) {
            guidedCalServices.createKlufeCal(Number(this.state.calInfo.instrument_pk), this.state.calInfo.date_string, this.state.calInfo.comment, this.state.user.userPK, this.state.calInfo.calibrated_with).then(result => {
                if (result.success) {
                    this.props.setEventPKs(result.data.klufe_calibration.pk, result.data.klufe_calibration.cal_event_pk);
                    this.setState({
                        klufePK: result.data.klufe_calibration.pk,
                        cal_event_pk: result.data.klufe_calibration.cal_event_pk,
                    })
                    this.props.incrementStep();
                }
                else {
                    this.setState({
                        errors: result.data
                    })
                }

            })
        }
        else {
            console.log("not creating new event and editing current")
            // TODO: call an edit
            guidedCalServices.updateKlufeCal(this.state.calInfo.date_string, this.state.calInfo.comment, this.state.klufePK).then(result => {
                if (result.success) {
                    this.props.incrementStep();
                }
                else {
                    this.setState({
                        errors: result.data
                    })
                }
            })
        }
    }

    async getStatus() {
        if (this.state.klufePK !== null) {
            guidedCalServices.getKlufeCalDetails(this.state.klufePK).then(result => {
                if (result.success) {
                    this.setState({
                        calInfo: {
                            ...this.state.calInfo,
                            comment: result.data.cal_event.comment,
                            date_object: new Date(result.data.cal_event.date + dateDetails),
                            date_string: result.data.cal_event.date,
                        }
                    })
                    this.getAssetTag(result.data.cal_event.calibrated_by_instruments[0])
                }
            })
        }
    }

    async getAssetTag(assetTag){
        instrumentServices.getInstrument(assetTag).then(result => {
            if(result.success){
                this.setState({
                    validKlufeMeter: true,
                    klufeInputDisabled: true,
                    calInfo: {
                        ...this.state.calInfo,
                        klufeAssetTag: result.data.asset_tag,
                    }
                })
            }
        })
    }
}


export default Step0;