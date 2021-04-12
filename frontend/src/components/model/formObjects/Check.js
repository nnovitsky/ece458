
import React from 'react';
import Item from './Item.js'
import '../FormPopup.css'
import Form from 'react-bootstrap/Form';
import CheckInputGroup from '../../formCal/formGroups/CheckInputGroup.js'


class Check extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            check: false,
        }

        this.onTextInput = this.onTextInput.bind(this);
        this.changePreviewCheck = this.changePreviewCheck.bind(this);
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
                />
            </div>
        );
    }

    makeBody() {
        return <div>
            <h5>Checkbox Input</h5>
            <div style={{ display: "flex" }}>
                <label className="required-field">Your Label </label>
                <input required type="text" value={this.props.label} onChange={this.onTextInput}></input>
            </div>
        </div>
    }

    makePreview() {
        let label = this.props.label === '' ? "Your Label" : this.props.label;
        return <Form style={{ paddingTop: "20px" }}>
                <CheckInputGroup
                    label={label}
                    id={this.props.id}
                    value={this.state.check}
                    onChange={this.changePreviewCheck}/>
        </Form>
    }

    changePreviewCheck() {
        this.setState({
            check: !this.state.check
        })
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
        this.props.setLabel(this.props.id, val);
    }
}

export default Check;

Check.defaultProps = {
    classes: "form-item-builder check",
}
