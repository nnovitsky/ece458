
import React from 'react';
import Item from './Item.js'
import '../FormPopup.css'
import Row from 'react-bootstrap/esm/Row';


class Header extends React.Component {

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
                <h5>Header</h5>
                <input type="text" value={this.props.headerInput} onChange={this.onTextInput} placeholder="Enter your header"></input>
        </div>
    }

    makePreview(){
        return <div style={{paddingTop: "10px"}}>
            <h5>
                {this.props.headerInput === '' ? "Your Header" : this.props.headerInput}
                </h5>
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
        this.props.setHeader(this.props.id, val);
    }
}

export default Header;

Header.defaultProps = {
    classes: "form-item-builder header",
}
