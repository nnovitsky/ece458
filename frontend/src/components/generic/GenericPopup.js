import React from 'react';

// This popup will make a generic dialog that will appear, it'll have a header, a body that is passed in as a prop,
// and then a row of buttons based on props passed in
// When passing in the body, it would likely be useful to keep track of the fields and a way to access them

// Props:
// 'body': html to put into the body of the popup
// 'headerText': string of the text to be displayed in the header
// 'buttonText': array of strings of for the buttons to be displayed
//, note: you can enter any number of buttons, the last one will be the primary button
// 'buttonFunctions': array of functions that corresponds to the button text in the previous prop
// the button function will be called on a click event
const genericPopup = () => {

    return (
        <Modal.Dialog>
            <Modal.Header closeButton>
                <Modal.Title>{props.headerText}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {props.body}
            </Modal.Body>

            <Modal.Footer>
                {buttonArray(props.buttonText, props.buttonFunctions)}
            </Modal.Footer>
        </Modal.Dialog>
    )
}

const buttonArray = (buttonText, buttonFunctions) => {
    let buttons = [];
    buttonText.forEach((btText, i) => {
        if (i == (buttonText.length - 1)) {
            buttons.push(
                <Button variant="primary" onClick={buttonFunctions[i]}>{btText}</Button>
            )
        } else {
            buttons.push(
                <Button variant="secondary" onClick={buttonFunctions[i]}>{btText}</Button>
            )
        }
    });
    return buttons;
}