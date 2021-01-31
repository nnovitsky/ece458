import React from 'react';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./Login.css";
 
const login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
       <div>
          <h1>Login</h1>
           <p>Home page body content</p>
       </div>
    );
}
export default login;