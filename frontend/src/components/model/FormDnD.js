import React, { useState } from "react";
import './FormPopup.css'
import { useDrag, useDrop } from "react-dnd";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Card() {
    const [{ isDragging }, dragRef] = useDrag({
        type: "card",
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    return (
        <div
            className="card"
            ref={dragRef}
            style={{
                //First color is background of card being left behind when you are dragging
                backgroundColor: isDragging ? "#fbb" : "palegoldenrod",
            }}
        >
            Card
    </div>
    );
}

function Box({ card, moveCard }) {
    const [{ isOver }, dropRef] = useDrop({
        accept: "card",
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
            {card ? <Card /> : "Box"}
        </div>
    );
}

function FormDnD() {
    const [index, setIndex] = useState(1);

    function moveCard(i) {
        setIndex(i);
    }

    return (
        <div className="app">
            <Row>
                <Col sm={6}>
                    <Box card={index === 1} moveCard={moveCard.bind(null, 1)}></Box>
                    <Box card={index === 2} moveCard={moveCard.bind(null, 2)}></Box>
                    <Box card={index === 3} moveCard={moveCard.bind(null, 3)}></Box>
                </Col>
                <Col sm={6}>
                    <Box card={index === 4} moveCard={moveCard.bind(null, 4)}></Box>
                    <Box card={index === 5} moveCard={moveCard.bind(null, 5)}></Box>
                    <Box card={index === 6} moveCard={moveCard.bind(null, 6)}></Box>
                </Col>
            </Row>
        </div>
    );
}

export default FormDnD;