
import React from 'react';
import Item from './Item.js'
import '../FormPopup.css'
import Row from 'react-bootstrap/esm/Row';


class PlainText extends React.Component {

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
                <h5>Plain Text</h5>
                <textarea value={this.props.text} onChange={this.onTextInput} placeholder="Enter your text"></textarea>
        </div>
    }

    makePreview(){
        return <div style={{paddingTop: "10px"}}>
                {this.props.text === '' ? "Your instructions as plain text." : this.props.text}
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
        console.log(val)
        this.props.setText(this.props.id, val);
    }
}

export default PlainText;

PlainText.defaultProps = {

}
