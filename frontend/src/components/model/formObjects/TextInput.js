
import React from 'react';
import Item from './Item.js'
import '../FormPopup.css'
import Row from 'react-bootstrap/esm/Row';


class TextInput extends React.Component {

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

    makeBody()
    {
        return <div>
                <h5>Text Line Input</h5>
                <input type="text" value={this.props.text} onChange={this.onTextInput} placeholder="Enter your label"></input>
        </div>
    }

    makePreview(){
        return <div style={{paddingTop: "10px"}}>
                    {this.props.text === '' ? "Your Label" : this.props.text}
                <div style={{paddingTop: "10px"}}>
                    <input type="text" style={{backgroundColor: "rgb(240, 240, 240)", width: "80%"}} placeholder="User input"></input>
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

    onTextInput(e){
        let val = e.target.value;
        this.props.setText(this.props.id, val);
    }
}

export default TextInput;

TextInput.defaultProps = {
    classes: "form-item-builder header",
}
