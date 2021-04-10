import React from 'react'
import GenericPopup from '../generic/GenericPopup';
import FormData from './Form.json'
import Form from 'react-bootstrap/Form';

class FormCal extends React.Component {

    constructor(props) {
        super(props);
        this.state ={
            errors: [],
            data: [],
        }
    }

    async componentDidMount() {
        //await this.getForm();
        this.setState({
            data: FormData.data
        })
    }

    render() {
        let body = this.makeBody();
        console.log(this.state.data)
        return (
            <GenericPopup
            show={this.props.isShown}
            body={body}
            headerText="Form Calibration"
            closeButtonText="Cancel"
            submitButtonText="Submit Calibration"
            onClose={this.props.onClose}
            onSubmit={this.props.onSubmit}
            submitButtonVariant="primary"
            errors={this.state.errors}
            isPrimaryEnabled={true}
        />
        );
    }

    makeBody(){
        let formItems = this.makeForm();
        return <div>
            <Form>
                {formItems}
            </Form>
        </div>
    }

    makeForm(){
        let form = []
        this.state.data.forEach(formField =>{
            let group;
            switch(formField.type){
                case "HEADER":
                    group = this.getHeaderForm(formField);
                    break;
                case "MESSAGE":
                    group = this.getPlainTextForm(formField);
                    break;
                case "TEXT_INPUT":
                    group = this.getTextInput(formField);
                    break;
                case "CHECK":
                    group = this.getCheckInput(formField);
                    break
                case "FLOAT_INPUT":
                    group = this.getNumericInput(formField);
                    break;
                default:
                    group = <Form.Group>Sup</Form.Group>
                    break;
            }
            form.push(group);
        })
        return form;
    }

    getHeaderForm(formField){
        return <Form.Group>
            <h5>{formField.text}</h5>
        </Form.Group>
    }

    getPlainTextForm(formField){
        return <Form.Group>
            <Form.Text>{formField.text}</Form.Text>
        </Form.Group>
    }

    getTextInput(formField){
        return <Form.Group>
            <Form.Label className="required-field">{formField.text}</Form.Label>
            <Form.Control></Form.Control>
        </Form.Group>
    }

    getCheckInput(formField){
        return <Form.Group className="form-inline">
            <Form.Label className="required-field">{formField.text}</Form.Label>
            <Form.Check style={{marginLeft: "10px"}}></Form.Check>
        </Form.Group>
    }

    getNumericInput(formField){
        return <Form.Group className="form-inline">
            <Form.Label className="required-field">{formField.text}</Form.Label>
            <Form.Control style={{marginLeft: "10px"}} type="number"></Form.Control>
        </Form.Group>
    }
}

export default FormCal;
