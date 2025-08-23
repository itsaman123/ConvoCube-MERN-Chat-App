import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../assets/logo.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginRoute } from "../utils/APIRoutes";

export default function Login() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: "", password: "" });
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };
  useEffect(() => {
    if (localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const validateForm = () => {
    const { username, password } = values;
    if (username === "") {
      toast.error("Email and Password is required.", toastOptions);
      return false;
    } else if (password === "") {
      toast.error("Email and Password is required.", toastOptions);
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      const { username, password } = values;
      const { data } = await axios.post(loginRoute, {
        username,
        password,
      });
      if (data.status === false) {
        toast.error(data.msg, toastOptions);
      }
      if (data.status === true) {
        localStorage.setItem(
          process.env.REACT_APP_LOCALHOST_KEY,
          JSON.stringify(data.user)
        );

        navigate("/");
      }
    }
  };

  return (
    <>
      <FormContainer>
        <form action="" onSubmit={(event) => handleSubmit(event)}>
          <div className="brand">
            <img src={Logo} alt="logo" />
            <h1>Convocube</h1>
          </div>
          <input
            type="text"
            placeholder="Username"
            name="username"
            onChange={(e) => handleChange(e)}
            min="3"
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            onChange={(e) => handleChange(e)}
          />
          <button type="submit">Log In</button>
          <span>
            Don't have an account ? <Link to="/register">Create One.</Link>
          </span>
        </form>
      </FormContainer>
      <ToastContainer />
    </>
  );
}

const FormContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background: #000000;
  padding: 1rem;
  box-sizing: border-box;
  
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img {
      height: 5rem;
      
      @media (max-width: 768px) {
        height: 4rem;
      }
      
      @media (max-width: 480px) {
        height: 3rem;
      }
    }
    h1 {
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 700;
      font-size: 2rem;
      
      @media (max-width: 768px) {
        font-size: 1.5rem;
        letter-spacing: 1px;
      }
      
      @media (max-width: 480px) {
        font-size: 1.2rem;
        letter-spacing: 0.5px;
      }
    }
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    background: #000000;
    border-radius: 2rem;
    padding: 3rem 5rem;
    box-shadow: 0 8px 32px 0 #8E75F033;
    border: 1.5px solid #8E75F0;
    backdrop-filter: blur(8px);
    width: 100%;
    max-width: 400px;
    
    @media (max-width: 768px) {
      padding: 2rem 3rem;
      gap: 1.5rem;
      border-radius: 1.5rem;
    }
    
    @media (max-width: 480px) {
      padding: 1.5rem 2rem;
      gap: 1.2rem;
      border-radius: 1rem;
    }
  }
  
  input {
    background: #333;
    padding: 1rem;
    border: 0.1rem solid #8E75F0;
    border-radius: 0.7rem;
    color: #ffffff;
    width: 100%;
    font-size: 1rem;
    transition: border 0.2s;
    box-sizing: border-box;
    
    @media (max-width: 480px) {
      padding: 0.8rem;
      font-size: 0.9rem;
    }
    
    &:focus {
      border: 0.1rem solid #8E75F0;
      outline: none;
    }
  }
  
  button {
    background: #8E75F0;
    color: #ffffff;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.7rem;
    font-size: 1rem;
    text-transform: uppercase;
    box-shadow: 0 2px 8px 0 #8E75F044;
    transition: background 0.2s;
    
    @media (max-width: 768px) {
      padding: 0.8rem 1.5rem;
      font-size: 0.9rem;
    }
    
    @media (max-width: 480px) {
      padding: 0.7rem 1.2rem;
      font-size: 0.8rem;
    }
    
    &:hover {
      background: #7A5FD0;
    }
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  span {
    color: #ffffff;
    text-transform: uppercase;
    text-align: center;
    font-size: 0.9rem;
    
    @media (max-width: 480px) {
      font-size: 0.8rem;
    }
    
    a {
      color: #ffffff;
      text-decoration: none;
      font-weight: bold;
      transition: color 0.2s;
      &:hover {
        color: #8E75F0;
      }
    }
  }
`;
