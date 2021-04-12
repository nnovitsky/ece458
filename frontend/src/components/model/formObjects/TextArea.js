
import React from 'react';
import Item from './Item.js'
import '../FormPopup.css'
import Row from 'react-bootstrap/esm/Row';


class TextArea extends React.Component {

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
           delete={this.props.onDelete}
            />
        </div>
        );
    }

    makeBody()
    {
        return <div>
                <h5>Text Area Input</h5>
                <input type="text" value={this.props.instructions} onChange={this.onTextInput} placeholder="Enter your instructions"></input>
        </div>
    }

    makePreview(){
        return <div style={{paddingTop: "10px"}}>
                    {this.props.instructions === '' ? "Your Instructions" : this.props.instructions}
                <div style={{paddingTop: "10px"}}>
                    <textarea placeholder="User input" style={{backgroundColor: "rgb(240, 240, 240)"}}></textarea>
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
        this.props.setInstructions(this.props.id, val);
    }
}

export default TextArea;

TextArea.defaultProps = {
    classes: "form-item-builder header",
}
