import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import LoadTable from './LoadTableDisplay.js'

const accordionTableCard = (props) => {

    return (
        <Card>
            <Accordion.Toggle as={Card.Header} eventKey={props.eventKey}>
                {props.title}
                        </Accordion.Toggle>
            <Accordion.Collapse eventKey={props.eventKey}>
                <Card.Body>
                    {props.tableHeader}
                    <LoadTable data={props.data}> </LoadTable>
                </Card.Body>
            </Accordion.Collapse>
        </Card>
    )

}

export default accordionTableCard;