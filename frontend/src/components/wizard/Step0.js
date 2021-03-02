import React from 'react'
import Base from './Base.js';
import Form from 'react-bootstrap/Form';
import DatePicker from 'react-datepicker';
import { dateToString } from '../generic/Util';
import "react-datepicker/dist/react-datepicker.css";
import WizardServices from "../../api/wizardServices.js";

const wizardServices = new WizardServices();



const modelName = "model";
const vendorName = "vendor";
const serial = "description";
const asset = "comment";
const engineer = "engineer"
const calDate = new Date()

class Step0 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errors: [],
            calInfo: {
                vendor: this.props.vendor,
                model_number: this.props.model_number,
                serial_number: this.props.serial_number,
                asset_tag: '',
                engineer: '',
                date: '',
                model_pk: this.props.model_pk,
                asset_list: [],
            },
        }

        this.onTextInput = this.onTextInput.bind(this);
        this.getAssetNumber = this.getAssetNumber.bind(this);
        this.createNewLoadbankEvent = this.createNewLoadbankEvent.bind(this);

    }

    async componentDidMount() {
        await this.getAssetNumber();
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
                <p>Please enter all additional fields then click continue to begin the Loadbank Event.</p>
                <Form.Group className="form-inline">
                    <Form.Label className="col-sm-3 col-form-label">Vendor:</Form.Label>
                    <Form.Control readonly="readonly" type="text" name={vendorName} value={this.state.calInfo.vendor} onChange={this.onTextInput} />
                    <Form.Label className="col-sm-3 col-form-label">Model Number:</Form.Label>
                    <Form.Control readonly="readonly" type="text" name={modelName} value={this.state.calInfo.model_number} onChange={this.onTextInput} />
                </Form.Group>
                <Form.Group className="form-inline">
                    <Form.Label className="col-sm-3 col-form-label">Serial Number:</Form.Label>
                    <Form.Control readonly="readonly" type="text" name={serial} value={this.state.calInfo.serial_number} onChange={this.onTextInput} />
                    <Form.Label className="col-sm-3 col-form-label">Asset Tag:</Form.Label>
                    <Form.Control type="text" name={asset} value={this.state.calInfo.asset_tag} onChange={this.onTextInput} />
                </Form.Group>
                <Form.Group className="form-inline">
                    <Form.Label className="col-sm-3 col-form-label">Engineer:</Form.Label>
                    <Form.Control type="text" name={engineer} value={this.state.calInfo.engineer} onChange={this.onTextInput} />
                    <Form.Label className="col-sm-3 col-form-label">Select a Date:</Form.Label>
                    <DatePicker onSelect={null} selected={calDate} />
                </Form.Group>
            </Form>

        </div>
    }


    onTextInput(e) {
        let val = e.target.value;
        switch (e.target.name) {
            case modelName:
                this.setState({
                    calInfo: {
                        ...this.state.calInfo,
                        model_number: val
                    }
                })
                return;
            case vendorName:
                this.setState({
                    calInfo: {
                        ...this.state.calInfo,
                        vendor: val
                    }
                })
                return;
            case serial:
                this.setState({
                    calInfo: {
                        ...this.state.calInfo,
                        serial_number: val
                    }
                })
                return;
            case asset:
                this.setState({
                    calInfo: {
                        ...this.state.calInfo,
                        asset_tag: val
                    }
                })
                return
            case engineer:
                this.setState({
                    calInfo: {
                        ...this.state.calInfo,
                        engineer: val
                    }
                })
                return
            default:
                return;
        }
    }

    async getAssetNumber(){
        wizardServices.getModelAssetTagByPK(this.state.calInfo.model_pk).then(result => {
            if(result.success){
                this.setState({
                    calInfo: {
                        ...this.state.calInfo,
                        asset_list: result.data,
                    }
                })
            }
        })
    }

    async createNewLoadbankEvent(){
        wizardServices.createLoadbankCalEvent(17602, "2020-01-02").then(result => {
            if(result.success){
                console.log("Created event " + result.data.loadbank_calibration.pk)
                this.props.setLBNum(result.data.loadbank_calibration.pk)
                this.props.incrementStep()
            }
            else{
                if(typeof(result.data.instrument) === 'undefined') {
                    if(typeof(result.data.date) !== 'undefined') {
                        this.setState({
                            errors: result.data.date
                        })
                    }
                }
                else{
                    this.setState({
                        errors: result.data.instrument
                    })
                }
            }
        })
    }
}


export default Step0;