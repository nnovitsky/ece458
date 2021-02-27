import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert'

class Base extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Modal className="popup" show={this.props.isShown} onHide={this.props.onClose} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>{this.props.title}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {this.props.body}
                </Modal.Body>

                <Modal.Footer>
                    <Alert className={"popup-alert"} variant={'danger'} show={this.props.errors.length > 0}>
                        {this.makeErrorsParagraphs(this.props.errors)}
                    </Alert>
                    <Button variant="secondary" className="mr-auto" onClick={this.props.onClose}>Cancel</Button>
                    <Button variant="primary" onClick={this.props.decrementStep}>Back</Button>
                    <Button variant="primary" onClick={this.props.incrementStep}>Continue</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    makeErrorsParagraphs(errorsArr){
        let result = [];
        errorsArr.forEach(e => {
            result.push(<p>{e}</p>)
        })
        return result;
    }
}


export default Base;