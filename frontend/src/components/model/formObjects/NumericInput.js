
import React, { createRef } from 'react';
import Item from './Item.js'
import '../FormPopup.css'
import Form from 'react-bootstrap/Form';
import NumericFormGroup from '../../formCal/formGroups/NumericFormGroup.js'


const setMax = "setMax"
const setMin = "setMin"
const setLabel = "setLabel"
class NumericInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            minRef: createRef(),
            maxRef: createRef(),
        }

        this.onTextInput = this.onTextInput.bind(this);
        this.onWheel = this.onWheel.bind(this);
    }

    render() {
        let body = this.makeBody();
        let preview = this.makePreview();
        return (
            <div >
                <Item
                    itemBody={body}
                    preview={preview}
                    id={this.props.id}
                    setStepNumber={this.props.setStepNumber}
                    delete={this.props.onDelete}
                    totalLength={this.props.totalLength}
                />
            </div>
        );
    }

    makeBody() {
        let max = this.props.max === null || typeof(this.props.max) === 'undefined' ? '' : this.props.max;
        let min = this.props.min === null || typeof(this.props.min) === 'undefined' ? '' : this.props.min;
        return <div>
            <h5>Float Input</h5>
            <div style={{display: "flex"}}>
                    <label className="required-field">Your Label </label>
                    <input required name={setLabel} type="text" value={this.props.label} onChange={this.onTextInput}></input>
                </div>
                <div className="special">
            Min: <input style={{border: 0}} type="number" name={setMin} value={min} ref={this.state.minRef}
                                onWheel={() => this.onWheel(this.state.minRef)} onChange={this.onTextInput} placeholder="Enter min"></input>
            Max: <input style={{border: 0}} type="number" name={setMax} value={max} ref={this.state.maxRef}
                                onWheel={() => this.onWheel(this.state.maxRef)} onChange={this.onTextInput} placeholder="Enter max"></input>
            </div>
        </div>
    }

    onWheel(ref){
        ref.current.blur();
    }

    makePreview() {
        let label = this.props.label === '' ? "Your Label" : this.props.label
        return <Form style={{ paddingTop: "20px" }}>
                <NumericFormGroup 
                    label={label}
                    min={this.props.min}
                    max={this.props.max}
                    /></Form>
    }

    makeErrorsParagraphs(errorsArr) {
        let result = [];
        errorsArr.forEach(e => {
            result.push(<p>{e}</p>)
        })
        return result;
    }

    onTextInput(e) {
        let val = e.target.value;
        switch (e.target.name) {
            case setMax:
                this.props.setMax(this.props.id, val)
                return
            case setMin:
                this.props.setMin(this.props.id, val)
                return
            case setLabel:
                this.props.setLabel(this.props.id, val)
                return
            default:
                return;
        }
    }
}



export default NumericInput;

NumericInput.defaultProps = {
}
