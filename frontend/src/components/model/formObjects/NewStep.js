
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import '../FormPopup.css'


class NewStep extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showMenu: false,
        }

        this.addNewStepMenu = this.addNewStepMenu.bind(this);
        this.addHeader = this.addHeader.bind(this);
        this.addNumeric = this.addNumeric.bind(this);
        this.addTextArea = this.addTextArea.bind(this);
        this.addPlainText = this.addPlainText.bind(this);
    }

    render() {
        let menu = <div className="row" style={{ width: "100%", height: "100%", margin: "auto"}}>
            <div className="col lg-3 header" onClick={this.addHeader}>
                Header
        </div>
            <div className="col lg-3 textArea" onClick={this.addTextArea}>
                Text Area
        </div>
            <div className="col lg-3 numeric" onClick={this.addNumeric}>
                Numeric Input
        </div>
            <div className="col lg-3 textLine" onClick={this.addPlainText}>
                Plain Text
        </div>
        </div>;

        let prompt = <div onClick={this.addNewStepMenu} style={{ width: "100%", height: "100%" , marginTop: "30px"}}>
                Add a New Step
        </div>
        return (
            <div className="new-step">
                {this.state.showMenu ? menu : prompt}
            </div>
        );
    }

    makeErrorsParagraphs(errorsArr) {
        let result = [];
        errorsArr.forEach(e => {
            result.push(<p>{e}</p>)
        })
        return result;
    }

    addNewStepMenu() {
        this.setState({
            showMenu: true,
        })
    }

    addHeader()
    {
        this.props.addHeader()
        this.setState({
            showMenu: false,
        })
    }

    addNumeric()
    {
        this.props.addNumeric()
        this.setState({
            showMenu: false,
        })
    }

    addTextArea()
    {
        this.props.addTextArea()
        this.setState({
            showMenu: false,
        })
    }

    addPlainText()
    {
        this.props.addPlainText()
        this.setState({
            showMenu: false,
        })
    }
}



export default NewStep;

NewStep.defaultProps = {
}