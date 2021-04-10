
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import '../FormPopup.css'
import { EditText } from 'react-edit-text';
import 'react-edit-text/dist/index.css';


class Item extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            number: (this.props.id + 1)
        }

        this.onTextInput = this.onTextInput.bind(this)
        this.onSave = this.onSave.bind(this)
    }

    render() {
        return (
            <div className={this.props.classes}>
                <div className="row" style={{ margin: "auto" }}>
                <div className="col-sm-1">
                    {/* <EditText type="number" style={{width: '50px'}} value={this.state.number} onSave={this.onSave} onChange={this.onTextInput}/> */}
                    <input type="number" style={{width: '40px', paddingLeft: "10px", backgroundColor: "rgba(230, 230, 230)"}} value={this.state.number} onChange={this.onTextInput} step={-1}></input>
                    </div>
                    <div className="col-sm-5">
                        {this.props.itemBody}
                    </div>
                    <div className={"col-sm-6 " + this.props.previewClasses}>
                        {this.props.preview}
                    </div>
                </div>
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

    onTextInput(e){
        console.log(e.target.value)
        this.setState({
            number: e.target.value
        })
        this.props.setStepNumber(this.props.id, e.target.value)
    }

    onSave(){
        this.props.setStepNumber(this.props.id, this.state.number)
        this.setState({
            number: this.props.id + 1
        })
    }
}



export default Item;

Item.defaultProps = {
    classes: "form-item-builder",
    previewClasses: "preview",
}
