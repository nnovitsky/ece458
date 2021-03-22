import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import ProgressBar from 'react-bootstrap/ProgressBar';
import './General.css'

class Base extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let progressBar = <div className="base-progress-bar">
            <ProgressBar className="base-progress-bar" now={this.props.progress} label={`${this.props.progress}%`} />
            <p>{this.props.progress === 0 ? "0% Completed" : "Completed"}</p>
        </div>
        return (
            <Modal className="popup" show={this.props.isShown} onHide={this.props.onClose} size="xl" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title className="base-header-title">{this.props.title}</Modal.Title>
                    {this.props.progressBarHidden ? null : progressBar}
                </Modal.Header>

                <Modal.Body>
                    {this.props.body}
                </Modal.Body>

                <Modal.Footer>
                    <Alert className={"popup-alert"} variant={'danger'} show={this.props.errors.length > 0}>
                        {this.makeErrorsParagraphs(this.props.errors)}
                    </Alert>
                    <Button hidden={this.props.isCancelHidden} variant="secondary" className="mr-auto" onClick={this.props.onClose}>Cancel</Button>
                    <Button hidden={this.props.isBackHidden} variant="primary" onClick={this.props.decrementStep}>{this.props.backButtonText}</Button>
                    <Button hidden={this.props.isContinueHidden} variant="primary" disabled={this.props.disableContinue} onClick={this.props.incrementStep}>{this.props.continueButtonText}</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    makeErrorsParagraphs(errorsArr) {
        let result = [];
        errorsArr.forEach(e => {
            result.push(<p>{e}</p>)
        })
        return result;
    }
}

export default Base;

Base.defaultProps = {
    disableContinue: false,
    title: 'Calibration Wizard',
    continueButtonText: 'Continue',
    backButtonText: 'Back',
    isCancelHidden: false,
    isBackHidden: false,
    isContinueHidden: false,
    progressBarHidden: false,
}
