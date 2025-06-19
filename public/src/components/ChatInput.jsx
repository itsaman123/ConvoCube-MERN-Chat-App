import React, { useState } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import styled from "styled-components";
import Picker from "emoji-picker-react";

export default function ChatInput({ handleSendMsg, onTyping }) {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiPickerhideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (event, emojiObject) => {
    let message = msg;
    message += emojiObject.emoji;
    setMsg(message);
  };

  const handleChange = (e) => {
    setMsg(e.target.value);
    onTyping();
  };

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.length > 0) {
      handleSendMsg(msg);
      setMsg("");
    }
  };

  return (
    <Container>
      <div className="button-container">
        <div className="emoji">
          <BsEmojiSmileFill onClick={handleEmojiPickerhideShow} />
          {showEmojiPicker && <Picker onEmojiClick={handleEmojiClick} />}
        </div>
      </div>
      <form className="input-container" onSubmit={(event) => sendChat(event)}>
        <input
          type="text"
          placeholder="type your message here"
          onChange={handleChange}
          value={msg}
        />
        <button type="submit">
          <IoMdSend />
        </button>
      </form>
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 5% 95%;
  background: #111;
  padding: 0 2rem;
  border-radius: 0 0 24px 24px;
  box-shadow: 0 2px 8px 0 #00fff744;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    padding: 0 1rem;
    gap: 1rem;
  }
  .button-container {
    display: flex;
    align-items: center;
    color: #00fff7;
    gap: 1rem;
    .emoji {
      position: relative;
      svg {
        font-size: 1.7rem;
        color: #00fff7;
        cursor: pointer;
        filter: drop-shadow(0 1px 2px #00fff744);
      }
      @media screen and (min-width: 390px) and (max-width: 719px) {
        svg {
          font-size: 1.5rem;
          color: #00fff7;
          cursor: pointer;
          padding-right: .6rem;
          overflow: hidden;
        }
      }
      .emoji-picker-react {
        position: absolute;
        top: -350px;
        background-color: #181818;
        box-shadow: 0 5px 10px #00fff7;
        border-color: #00fff7;
      }
    }
  }
  .input-container {
    width: 100%;
    border-radius: 2rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    background: #181818;
    box-shadow: 0 2px 8px 0 #00fff744;
    input {
      width: 90%;
      height: 60%;
      background: transparent;
      color: #00fff7;
      border: none;
      padding-left: 1rem;
      font-size: 1.2rem;
      &::selection {
        background-color: #00fff7;
        color: #111;
      }
      &:focus {
        outline: none;
      }
    }
    button {
      padding: 0.3rem 2rem;
      border-radius: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(90deg, #00fff7 0%, #222 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 2px 8px 0 #00fff744;
      @media screen and (min-width: 720px) and (max-width: 1080px) {
        padding: 0.3rem 1rem;
        svg {
          font-size: 1rem;
        }
      }
      svg {
        font-size: 2rem;
        color: #111;
      }
    }
  }
`;
