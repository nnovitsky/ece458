
import React from 'react';
import '../FormPopup.css'


class Item extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            number: (this.props.id + 1)
        }

        this.onTextInput = this.onTextInput.bind(this)
        this.getOptions = this.getOptions.bind(this)
    }

    render() {
        let selectOptions = this.getOptions();
        return (
            <div className={this.props.classes}>
                <div className="row" style={{ margin: "auto" }}>
                    <div className="col-sm-1 main">
                        <select style={{marginTop: "5px"}} value={this.state.number} onChange={this.onTextInput} >
                            {selectOptions}
                        </select>
                    </div>
                    <div className="col-sm-5 main">
                        {this.props.itemBody}
                    </div>
                    <div className="col-xs-1 main">
                        <button className="delete" onClick={() => this.props.delete(this.props.id)}>X</button>
                    </div>
                    <div className={"col-sm-5 " + this.props.previewClasses}>
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

    onTextInput(e) {
        console.log(e.target.value)
        this.setState({
            number: e.target.value
        })
        if(this.props.setStepNumber(this.props.id, e.target.value))
        {
            this.setState({
                number: (this.props.id + 1)
            })
        }
    }

    getOptions(){
        let items = []
        for(let i = 1; i < this.props.totalLength + 1; i++){
            items.push(<option value={i}>{i}</option>)
        }
        return items;
    }
}



export default Item;

Item.defaultProps = {
    classes: "form-item-builder",
    previewClasses: "preview",
    getOptions: () => {},
}
