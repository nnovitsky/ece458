
import React from 'react';
import Item from './Item.js'
import '../FormPopup.css'
import Row from 'react-bootstrap/esm/Row';


class Check extends React.Component {

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
           classes={this.props.classes}
           previewClasses={this.props.classes}
           setStepNumber={this.props.setStepNumber}
            />
        </div>
        );
    }

    makeBody()
    {
        return <div>
                <h5>Checkbox Input</h5>
                <div style={{display: "flex"}}>
                    <label className="required-field">Your Label </label>
                    <input required type="text" value={this.props.label} onChange={this.onTextInput}></input>
                </div>
        </div>
    }

    makePreview(){
        return <div style={{paddingTop: "10px", display: "flex"}}>
                {this.props.label === '' ? "Your Label" : this.props.label}
                <br></br>
                <input style={{marginLeft: "10px", marginTop: "5px"}} type="checkbox"></input>
            </div>
    }

    makeErrorsParagraphs(errorsArr) {
        let result = [];
        errorsArr.forEach(e => {
            result.push(<p>{e}</p>)
        })
        return result;
    }

    onTextInput(e){
        let val = e.target.value;
        this.props.setLabel(this.props.id, val);
    }
}

export default Check;

Check.defaultProps = {
    classes: "form-item-builder check",
}
