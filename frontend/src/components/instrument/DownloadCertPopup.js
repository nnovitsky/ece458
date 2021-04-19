import React, { useState } from 'react';
import GenericPopup from '../generic/GenericPopup';
import Form from "react-bootstrap/Form";
//props
//'isShown': boolean if popup is shown
//'onClose': event handler for the popup being closed
//'onSubmit': event handler for the calibration being submitted, will receive 'true' if the chain of truth is desired, 'false' if not

const DownloadCertificatePopup = (props) => {
    const [isChainOfTruth, setChainOfTruth] = useState(false);

    return (
        <GenericPopup
            show={props.isShown}
            body={makeBody(isChainOfTruth, setChainOfTruth)}
            headerText="Download Calibration Certificate"
            closeButtonText="Cancel"
            submitButtonText={'Download'}
            onClose={props.onClose}
            onSubmit={() => props.onSubmit(isChainOfTruth)}
            submitButtonVariant="primary"
            errors={[]}
        />
    )
}

const makeBody = (isChainOfTruth, setChainOfTruth) => {
    return (
        <div>
            <Form className="popup">
                <Form.Group>
                    <Form.Label>Include Chain of Truth</Form.Label>
                    <Form.Check
                        id={'chain of truth'}
                        type="radio"
                        label="Yes"
                        onChange={() => setChainOfTruth(true)}
                        checked={isChainOfTruth}/>
                    <Form.Check
                        id={'regular'}
                        type="radio"
                        label="No"
                        onChange={() => setChainOfTruth(false)}
                        checked={!isChainOfTruth}/>
                </Form.Group>
            </Form>
        </div>
    )
}


export default DownloadCertificatePopup;