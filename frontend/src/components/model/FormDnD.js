import React, { useState } from "react";
import './FormPopup.css'
import { useDrag, useDrop } from "react-dnd";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Header({ id }) {
    const [{ isDragging }, dragRef] = useDrag({
        type: "header",
        //drag: () => dragIt(),
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    return (
        <div
            className="card-header"
            ref={dragRef}
            id={id}
            style={{
                //First color is background of card being left behind when you are dragging
                backgroundColor: isDragging ? "#fbb" : "rgba(200, 255, 187, 0.411)",
            }}
        >
            <h5>Header {id}</h5>
            <input type="text" placeholder="Your Header Text"></input>
    </div>
    );
}

function Box({ header, moveCard, id }) {
    const [{ isOver }, dropRef] = useDrop({
        accept: "header",
        drop: () => moveCard(),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    });
    return (
        <div
            className="box"
            ref={dropRef}
            style={{
                //If you are moving to an empty spot then first color is that new spot
                backgroundColor: isOver ? "#bbf" : "rgba(0,0,0,.12"
            }}
        >
            {header ? <Header id={id}/> : "Box"}
        </div>
    );
}

function FormDnD(props) {
    const [index, setIndex] = useState(1);

    console.log(props.form)

    function moveCard(key, value) {
        setIndex(value);
        console.log(`here with ${value}`)
    }

    function noCard() {
        
    }

    function dragIt(key, value) {
        console.log(`here with ${key} ${value}`)
    }

    return (
        <div className="app">
            <Row>
                <Col sm={6}>
                    <Box id={1} headerId={props.form[1]} header={index === 1} moveCard={moveCard.bind(null, "Step1", 1)}></Box>
                    <Box id={2} header={index === 2} moveCard={moveCard.bind(null, "Step2", 2)}></Box>
                    <Box id={3} header={index === 3} moveCard={moveCard.bind(null, "Step3", 3)}></Box>
                </Col>
                <Col sm={6}>
                    <Box id={4} header={true} moveCard={moveCard.bind(null, 4)}></Box>
                    <Box id={5} header={false} moveCard={noCard}></Box>
                    <Box id={6} header={false} moveCard={noCard}></Box>
                </Col>
            </Row>
        </div>
    );
}

export default FormDnD;