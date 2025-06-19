import React, { useState, useEffect } from "react";
import styled from "styled-components";
// import Robot from "../assets/robot.gif";
export default function Welcome() {
  const [userName, setUserName] = useState("");
  useEffect(async () => {
    setUserName(
      await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      ).username
    );
  }, []);
  return (
    <Container>
      {/* <img src={Robot} alt="" /> */}
      <h1>
        Welcome, <span>{userName}!</span>
      </h1>
      <h3>Please select a chat to Start messaging.</h3>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: #00fff7;
  flex-direction: column;
  background: #181818;
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 #00fff733;
  padding: 3rem 4rem;
  img {
    height: 20rem;
  }
  span {
    color: #00fff7;
    font-weight: 700;
    letter-spacing: 2px;
  }
`;
