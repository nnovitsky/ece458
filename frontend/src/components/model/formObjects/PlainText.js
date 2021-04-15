
import React from 'react';
import Item from './Item.js'
import '../FormPopup.css'
import Form from 'react-bootstrap/Form';
import PlainTextGroup from '../../formCal/formGroups/PlainTextGroup.js'


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
                    classes={this.props.classes}
                    previewClasses={this.props.classes}
                    delete={this.props.onDelete}
                    totalLength={this.props.totalLength}
                />
            </div>
        );
    }

    makeBody() {
        return <div>
            <h5 style={{ marginBottom: "0px" }}>Plain Text</h5>
            <label className="required-field">Your Text</label>
            <textarea style={{ marginTop: "-3px" }} value={this.props.text} onChange={this.onTextInput} placeholder="Enter your text"></textarea>
        </div>
    }

    makePreview() {
        let text = this.props.text === '' ? "Your instructions as plain text." : this.props.text
        return <Form style={{ paddingTop: "10px" }}>
                    <PlainTextGroup
                    text={text} />
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
        this.props.setText(this.props.id, val);
    }
}

export default PlainText;

PlainText.defaultProps = {
    classes: "form-item-builder plain-text",
}
