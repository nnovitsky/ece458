
import React from 'react';
import Item from './Item.js'
import '../FormPopup.css'
import Row from 'react-bootstrap/esm/Row';


const setMax = "setMax"
const setMin = "setMin"
const setLabel = "setLabel"
class NumericInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        }

        this.onTextInput = this.onTextInput.bind(this);
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
                />
            </div>
        );
    }

    makeBody() {
        return <div>
            <h5>Numeric Input</h5>
            <input type="text" name={setLabel} value={this.props.label} onChange={this.onTextInput} placeholder="Enter label"></input>
            Min: <input type="number" name={setMin} value={this.props.min} onChange={this.onTextInput} placeholder="Enter min"></input>
            Max: <input type="number" name={setMax} value={this.props.max} onChange={this.onTextInput} placeholder="Enter max"></input>
        </div>
    }

    makePreview() {
        return <div style={{ paddingTop: "10px" }}>
            {this.props.label === '' ? "Your label instructions" : this.props.label}
            <br></br>
            <div style={{ paddingTop: "10px" }}>
                <input type="number" placeholder="Enter value"></input>
                <span className="subtext">Value must be between {this.props.min} - {this.props.max}</span>
            </div>
        </div>
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
