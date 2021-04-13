
import React from 'react';
import Item from './Item.js'
import '../FormPopup.css'
import Form from 'react-bootstrap/Form';
import TextInputGroup from '../../formCal/formGroups/TextInputGroup.js'


class TextInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        }
        this.onLabelInput = this.onLabelInput.bind(this);
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

    makeBody() {
        return <div>
            <h5>Text Line Input</h5>
            <div style={{ display: "flex" }}>
                <label className="required-field">Your Label </label>
                <input required type="text" value={this.props.label} onChange={this.onLabelInput}></input>
            </div>
            <div style={{ display: "flex" }}>
                <label className="required-field">Expected Input</label>
                <input required type="text" value={this.props.expected_text} onChange={this.onTextInput}></input>
            </div>
        </div>
    }

    makePreview() {
        let label = this.props.label === '' ? "Your Label" : this.props.label;
        return <Form style={{ paddingTop: "10px" }}>
                    <TextInputGroup
                    label={label} />
                </Form>
    }

    makeErrorsParagraphs(errorsArr) {
        let result = [];
        errorsArr.forEach(e => {
            result.push(<p>{e}</p>)
        })
        return result;
    }

    onLabelInput(e) {
        let val = e.target.value;
        this.props.setLabel(this.props.id, val);
    }

    onTextInput(e) {
        let val = e.target.value;
        this.props.setText(this.props.id, val);
    }
}

export default TextInput;

TextInput.defaultProps = {
    classes: "form-item-builder header",
}
