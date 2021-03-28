
import React from 'react'
import './GuidedCal.css'

const klufe = (props) => {
    let klufeOutput = props.outputOn ? <b>On</b> : "Off";
    return (
        <div className="fluke-display">
            <div className="row">
                <div className="col">
                    <h3>Klufe Calibrator</h3>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <h7>Status: {props.connected ? <b>SSH Connected</b> : "Not Connected"}</h7>
                    <br></br>
                    <h7>Output: {props.outputOn === null? "" : klufeOutput}</h7>
                    <br></br>
                    <h7>Mode: {props.mode}</h7>
                    <br></br>
                    <h7>Frequency: {props.freq !== '' ? props.freq : ''}</h7>
                </div>
                <div className="col">
                    <h7>Output Voltage:</h7>
                    <h4>{props.voltage === '' ? 'No Output' : `${props.voltage} V`}</h4>
                </div>
            </div>
        </div>
    );
}



export default klufe;