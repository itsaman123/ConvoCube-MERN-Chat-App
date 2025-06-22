import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";
import UserAvatar from "./UserAvatar";
import { FaCheck, FaCheckDouble } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function ChatContainer({ currentChat, socket }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      const data = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );
      setCurrentUser(data);
      const response = await axios.post(recieveMessageRoute, {
        from: data._id,
        to: currentChat._id,
      });
      setMessages(response.data);
    };
    fetchMessages();
  }, [currentChat]);

  useEffect(() => {
    if (socket.current) {
      const handleMsgReceive = (data) => {
        setArrivalMessage({
          fromSelf: false,
          message: data.msg,
          status: data.status,
          from: data.from
        });
      };

      const handleUserTyping = (data) => {
        if (data.from === currentChat._id) {
          setIsTyping(true);
        }
      };

      const handleUserStoppedTyping = (data) => {
        if (data.from === currentChat._id) {
          setIsTyping(false);
        }
      };

      const handleMsgDelivered = (data) => {
        if (data.to === currentChat._id) {
          updateMessageStatus(data.messageId, "delivered");
        }
      };

      const handleMsgSeen = (data) => {
        if (data.to === currentChat._id) {
          updateMessageStatus(data.messageId, "seen");
        }
      };

      socket.current.on("msg-recieve", handleMsgReceive);
      socket.current.on("user-typing", handleUserTyping);
      socket.current.on("user-stopped-typing", handleUserStoppedTyping);
      socket.current.on("msg-delivered", handleMsgDelivered);
      socket.current.on("msg-seen", handleMsgSeen);

      // Cleanup function
      return () => {
        if (socket.current) {
          socket.current.off("msg-recieve", handleMsgReceive);
          socket.current.off("user-typing", handleUserTyping);
          socket.current.off("user-stopped-typing", handleUserStoppedTyping);
          socket.current.off("msg-delivered", handleMsgDelivered);
          socket.current.off("msg-seen", handleMsgSeen);
        }
      };
    }
  }, [currentChat]);

  const updateMessageStatus = (messageId, status) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg._id === messageId ? { ...msg, status } : msg
      )
    );
  };

  const handleSendMsg = async (msg) => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );

    const messageId = uuidv4();
    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: data._id,
      msg,
      messageId
    });

    await axios.post(sendMessageRoute, {
      from: data._id,
      to: currentChat._id,
      message: msg,
      messageId
    });

    const msgs = [...messages];
    msgs.push({
      fromSelf: true,
      message: msg,
      status: "sending",
      _id: messageId
    });
    setMessages(msgs);

    // Mark message as sent after a short delay
    setTimeout(() => {
      updateMessageStatus(messageId, "sent");
    }, 1000);
  };

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = () => {
    if (socket.current) {
      socket.current.emit("typing", {
        to: currentChat._id,
        from: currentUser._id,
        isTyping: true
      });

      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        socket.current.emit("stop-typing", {
          to: currentChat._id,
          from: currentUser._id
        });
      }, 2000);

      setTypingTimeout(timeout);
    }
  };

  const renderMessageStatus = (status) => {
    switch (status) {
      case "sending":
        return <span className="status sending">Sending...</span>;
      case "sent":
        return <FaCheck className="status-icon" />;
      case "delivered":
        return <FaCheckDouble className="status-icon" />;
      case "seen":
        return <FaCheckDouble className="status-icon seen" />;
      default:
        return null;
    }
  };

  const handleChatUserProfile = () => {
    navigate(`/profile/${currentChat._id}`);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <UserAvatar image={currentChat.avatarImage} onClick={handleChatUserProfile} />
          <div className="username">
            <h3>{currentChat.username}</h3>
            {isTyping && <span className="typing-indicator">typing...</span>}
          </div>
        </div>
        <Logout />
      </div>
      <div className="chat-messages">
        {messages.map((message) => {
          return (
            <div ref={scrollRef} key={message._id || uuidv4()}>
              <div
                className={`message ${message.fromSelf ? "sended" : "recieved"
                  }`}
              >
                <div className="content">
                  <p>{message.message}</p>
                  {message.fromSelf && (
                    <div className="message-status">
                      {renderMessageStatus(message.status)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} onTyping={handleTyping} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  background: #181818;
  border-radius: 0 24px 24px 0;
  box-shadow: 0 8px 32px 0 #00fff733;

  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    background: #111;
    border-radius: 0 24px 0 0;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 2.8rem;
        }
      }
      .username {
        h3 {
          color: #00fff7;
          font-weight: 700;
        }
        .typing-indicator {
          color: #00fff7;
          font-size: 0.8rem;
          font-style: italic;
        }
      }
    }
  }

  .chat-messages {
    padding: 1.5rem 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #00fff7;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 48%;
        overflow-wrap: break-word;
        padding: 1.1rem 1.5rem;
        font-size: 1.1rem;
        border-radius: 1.5rem;
        color: #00fff7;
        position: relative;
        box-shadow: 0 2px 8px 0 #00fff722;
        .message-status {
          position: absolute;
          bottom: -15px;
          right: 0;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.2rem;
          .status {
            color: #00fff7;
            &.sending {
              font-style: italic;
            }
          }
          .status-icon {
            font-size: 0.8rem;
            color: #00fff7;
            &.seen {
              color: #00fff7;
            }
          }
        }
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background: linear-gradient(90deg, #00fff7 0%, #222 100%);
        color: #111;
        border-bottom-right-radius: 0.5rem;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background: #222;
        color: #00fff7;
        border-bottom-left-radius: 0.5rem;
      }
    }
  }
`;
