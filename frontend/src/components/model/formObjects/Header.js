
import React from 'react';
import Item from './Item.js'
import '../FormPopup.css'
import Form from 'react-bootstrap/Form';
import HeaderGroup from '../../formCal/formGroups/HeaderGroup.js'


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
                    delete={this.props.onDelete}
                    totalLength={this.props.totalLength}
                />
            </div>
        );
    }

    makeBody() {
        return <div>
            <h5>Header</h5>
            <div style={{ display: "flex", marginTop: "-5px" }}>
                <label className="required-field">Your Header</label>
                <input type="text" value={this.props.headerInput} onChange={this.onTextInput}></input>
            </div>
        </div>
    }

    makePreview() {
        let header = this.props.headerInput === '' ? "Your Header" : this.props.headerInput;
        return <Form style={{ paddingTop: "10px" }}>
            <HeaderGroup
                text={header}/>
            </Form>
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
        this.props.setHeader(this.props.id, val);
    }
}

export default Header;

Header.defaultProps = {
    classes: "form-item-builder header",
}
