import Loader from "react-loader-spinner";
import './General.css';


let isShown;
let divShown;

const GenericLoader = (props) => {

    isShown = props.isShown;
    if(!isShown)
    {
        divShown = "none"; 
    }
    else{
        divShown = ""; 
    }

    return (
        <div className="stack-top" style={{display: divShown}}>
            <Loader className="loader"
                type="Puff"
                color="Black"
                height={100}
                width={100}
                visible={isShown}
            />
            <h3>Loading Request</h3>
        </div>
    );
}

export default GenericLoader;