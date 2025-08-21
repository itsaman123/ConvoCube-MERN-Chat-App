import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";
import UserAvatar from "./UserAvatar";
import { FaCheck, FaCheckDouble, FaRegCopy, FaReply } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ChatContainer({ currentChat, socket, showMobileBackButton, onMobileBack }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const [replyTo, setReplyTo] = useState(null);

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
        // Check if this message is for the current chat
        if (currentChat.isGroup) {
          // For group messages, check if the 'to' field matches current group
          if (data.to === currentChat._id) {
            setArrivalMessage({
              fromSelf: false,
              message: data.msg,
              status: data.status,
              from: data.from
            });
          }
        } else {
          // For individual messages, check if the 'from' field matches current chat
          if (data.from === currentChat._id) {
            setArrivalMessage({
              fromSelf: false,
              message: data.msg,
              status: data.status,
              from: data.from
            });

          }
        }
      };

      const handleUserTyping = (data) => {
        if (currentChat.isGroup) {
          // For group typing, check if it's for the current group
          if (data.to === currentChat._id) {
            setIsTyping(true);
          }
        } else {
          // For individual typing
          if (data.from === currentChat._id) {
            setIsTyping(true);
          }
        }
      };

      const handleUserStoppedTyping = (data) => {
        if (currentChat.isGroup) {
          // For group typing, check if it's for the current group
          if (data.to === currentChat._id) {
            setIsTyping(false);
          }
        } else {
          // For individual typing
          if (data.from === currentChat._id) {
            setIsTyping(false);
          }
        }
      };

      const handleMsgDelivered = (data) => {
        if (currentChat.isGroup) {
          if (data.to === currentChat._id) {
            updateMessageStatus(data.messageId, "delivered");
          }
        } else {
          if (data.to === currentChat._id) {
            updateMessageStatus(data.messageId, "delivered");
          }
        }
      };

      const handleMsgSeen = (data) => {
        if (currentChat.isGroup) {
          if (data.to === currentChat._id) {
            updateMessageStatus(data.messageId, "seen");
          }
        } else {
          if (data.to === currentChat._id) {
            updateMessageStatus(data.messageId, "seen");
          }
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

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Message copied!", { position: "bottom-right", autoClose: 2000, theme: "dark" });
  };

  const handleReplyMessage = (message) => {
    setReplyTo(message);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
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
      messageId,
      replyTo: replyTo ? replyTo._id : null,
    });

    const response = await axios.post(sendMessageRoute, {
      from: data._id,
      to: currentChat._id,
      message: msg,
      messageId,
      replyTo: replyTo ? replyTo._id : null,
    });

    // Add the message to local state with "sent" status since it's now in the database
    const msgs = [...messages];
    msgs.push({
      fromSelf: true,
      message: msg,
      status: "sent", // Set to "sent" since it's now stored in database
      _id: messageId,
      replyTo: replyTo ? { ...replyTo } : null,
    });
    setMessages(msgs);
    setReplyTo(null);
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
        return <FaCheck cclassName="status-icon" />;
      case "sent":
        return <FaCheck cclassName="status-icon" />;
      case "delivered":
        return <FaCheckDouble className="status-icon" />;
      case "seen":
        return <FaCheckDouble className="status-icon seen" />;
      default:
        return null;
    }
  };

  const handleChatUserProfile = () => {
    if (currentChat.isGroup) {
      navigate(`/group/${currentChat._id}`);
    } else {
      navigate(`/profile/${currentChat._id}`);
    }
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
          {/* Mobile back button */}
          {showMobileBackButton && (
            <button
              className="mobile-back-btn"
              onClick={onMobileBack}
              aria-label="Back to contacts"
            >
              <span className="arrow-icon">&#11013;</span>
            </button>
          )}
          <UserAvatar image={currentChat.avatarImage || currentChat.avatar} onClick={handleChatUserProfile} name={currentChat.isGroup ? currentChat.name : currentChat.username} />
          <div className="username">
            <h3>{currentChat.isGroup ? currentChat.name : currentChat.username}</h3>
            {isTyping && <span className="typing-indicator">typing...</span>}
            {currentChat.isGroup && currentChat.members && (
              <div className="group-members" style={{ marginTop: '0.3rem', fontSize: '0.9rem', color: '#ffffff', fontWeight: 500 }}>
                {currentChat.members.map(m => m.username).join(', ')}
              </div>
            )}
          </div>
        </div>
        <Logout />
      </div>
      <div className="chat-messages">
        {messages.map((message) => {
          // Find the replied message text if replyTo is an ID or object
          let replyText = null;
          if (message.replyTo) {
            if (typeof message.replyTo === 'object' && message.replyTo.message) {
              replyText = message.replyTo.message;
            } else if (typeof message.replyTo === 'string') {
              const refMsg = messages.find(m => m._id === message.replyTo);
              replyText = refMsg ? refMsg.message : '(message)';
            }
          }
          return (
            <div ref={scrollRef} key={message._id || uuidv4()}>
              <div
                className={`message ${message.fromSelf ? "sended" : "recieved"}`}
              >
                <div className="content">
                  {replyText && (
                    <div className="reply-preview" style={{ fontSize: '0.9rem', color: '#ffffff', background: '#333', borderLeft: '3px solid #8E75F0', padding: '0.2rem 0.7rem', marginBottom: '0.3rem', borderRadius: '0.5rem' }}>
                      Replying to: {replyText}
                    </div>
                  )}
                  <p>{message.message}</p>
                  {message.fromSelf && (
                    <div className="message-status">
                      {renderMessageStatus(message.status)}
                    </div>
                  )}
                </div>
                <div className="message-actions">
                  <FaRegCopy title="Copy" onClick={() => handleCopyMessage(message.message)} />
                  <FaReply title="Reply" onClick={() => handleReplyMessage(message)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="chat-input-container">
        {replyTo && (
          <ReplyPreview>
            <span>Replying to: {replyTo.message}</span>
            <button onClick={handleCancelReply}>X</button>
          </ReplyPreview>
        )}
        <ChatInput handleSendMsg={handleSendMsg} onTyping={handleTyping} />
      </div>
      <ToastContainer />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 75% 15%;
  gap: 0.1rem;
  overflow: hidden;
  background: #000000;
  border-radius: 0 24px 24px 0;
  box-shadow: 0 8px 32px 0 #8E75F033;

  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }

  @media screen and (max-width: 719px) {
    height: 100vh !important;
    width: 100vw !important;
    min-height: 100vh !important;
    max-height: 100vh !important;
    min-width: 100vw !important;
    max-width: 100vw !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    grid-template-rows: 10% 75% 15%;
    .chat-header, .chat-messages, .chat-input-container {
      width: 100vw !important;
      min-width: 100vw !important;
      max-width: 100vw !important;
    }
    .chat-messages {
      height: 75vh !important;
      min-height: 75vh !important;
      max-height: 75vh !important;
      padding: 1rem 0.5rem !important;
    }
    .chat-header {
      height: 10vh !important;
      min-height: 10vh !important;
      max-height: 10vh !important;
      padding: 0 1rem !important;
      border-radius: 0 !important;
    }
    .chat-input-container {
      height: 15vh !important;
      min-height: 15vh !important;
      max-height: 15vh !important;
      border-radius: 0 !important;
      position: relative !important;
      overflow: hidden !important;
    }
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
      .mobile-back-btn {
        display: none;
        background: none;
        border: none;
        color: #ffffff;
        margin-right: 0.2rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        @media screen and (max-width: 719px) {
          display: block;
        }
        .arrow-icon {
          font-size: 1.5rem;
          font-weight: bold;
          line-height: 1;
          display: inline-block;
        }
      }
      .avatar {
        img {
          height: 2.8rem;
        }
      }
      .username {
        h3 {
          color: #ffffff;
          font-weight: 700;
        }
        .typing-indicator {
          color: #ffffff;
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
        background-color: #8E75F0;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: flex-start;
      position: relative;
      .content {
        max-width: 48%;
        overflow-wrap: break-word;
        padding: 1.1rem 1.5rem;
        font-size: 1.1rem;
        border-radius: 1.5rem;
        color: #ffffff;
        position: relative;
        box-shadow: 0 2px 8px 0 #8E75F022;
        .message-status {
          position: absolute;
          bottom: -15px;
          right: 0;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.2rem;
          .status {
            color: #ffffff;
            &.sending {
              font-style: italic;
            }
          }
          .status-icon {
            font-size: 0.8rem;
            color: #ffffff;
            &.seen {
              color: #ffffff;
            }
          }
        }
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
      .message-actions {
        display: none;
        gap: 0.7rem;
        align-items: center;
        position: absolute;
        top: -1.5rem;
        left: 0;
        background: #181818;
        padding: 0.3rem 0.7rem;
        border-radius: 0.5rem;
        border: 1px solid #8E75F0;
        box-shadow: 0 2px 8px 0 #8E75F044;
        z-index: 10;
        svg {
          cursor: pointer;
          color: #ffffff;
          font-size: 1rem;
          transition: color 0.2s;
          &:hover {
            color: #8E75F0;
            filter: brightness(1.5);
          }
        }
      }
      &:hover .message-actions {
        display: flex;
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background: #8E75F0;
        color:hsl(0, 0.00%, 100.00%);
        border-bottom-right-radius: 0.5rem;
      }
      .message-actions {
        right: 0;
        left: auto;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background: #333;
        color: #ffffff;
        border-bottom-left-radius: 0.5rem;
      }
      .message-actions {
        left: 0;
      }
    }
  }

  .chat-input-container {
    display: flex;
    flex-direction: column;
    background: #111;
    border-radius: 0 0 24px 24px;
    min-height: 15vh;
    position: relative;
  }
`;

const ReplyPreview = styled.div`
  background: #333;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-left: 3px solid #8E75F0;
  border-radius: 0.5rem;
  margin: 0rem 8rem 0.5rem 5rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
  z-index: 2;
  max-height: 4rem;
  overflow: hidden;
  
  @media screen and (max-width: 719px) {
    margin: 0rem 1rem 0.3rem 1rem;
    padding: 0.4rem 0.8rem;
    max-height: 3.5rem;
  }
  
  span {
    flex: 1;
    line-height: 1.2;
    max-height: 2.4rem;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-wrap: break-word;
    margin-right: 0.5rem;
    font-size: 0.9rem;
    
    @media screen and (max-width: 719px) {
      font-size: 0.85rem;
      max-height: 2.1rem;
      margin-right: 0.3rem;
    }
  }
  
  button {
    background: none;
    border: none;
    color: #ffffff;
    cursor: pointer;
    font-weight: 700;
    font-size: 1rem;
    flex-shrink: 0;
    padding: 0;
    margin-left: 0.5rem;
    
    @media screen and (max-width: 719px) {
      font-size: 0.9rem;
      margin-left: 0.3rem;
    }
  }