import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import TopNavbar from "../components/TopNavbar";
export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [showMobileContacts, setShowMobileContacts] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      if (!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
        navigate("/login");
      } else {
        setCurrentUser(
          await JSON.parse(
            localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
          )
        );
      }
    };
    checkUser();
  }, [navigate]);
  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }

    // Cleanup function
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [currentUser]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (currentUser) {
        if (currentUser.isAvatarImageSet) {
          const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
          setContacts(data.data)
        } else {
          navigate("/setAvatar");
        }
      }
    };
    fetchContacts();
  }, [currentUser, navigate]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
    if (window.innerWidth <= 719) {
      setShowMobileContacts(false);
    }
  };

  const handleBackToContacts = () => {
    setShowMobileContacts(true);
    setCurrentChat(undefined);
  };

  const isMobile = window.innerWidth <= 719;

  return (
    <>
      <Container>
        <TopNavbar />
        <div className="container">
          {isMobile ? (
            showMobileContacts ? (
              <Contacts contacts={contacts} changeChat={handleChatChange} />
            ) : (
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                {currentChat === undefined ? (
                  <Welcome />
                ) : (
                  <ChatContainer
                    currentChat={currentChat}
                    socket={socket}
                    showMobileBackButton={true}
                    onMobileBack={handleBackToContacts}
                  />
                )}
              </div>
            )
          ) : (
            <>
              <Contacts contacts={contacts} changeChat={handleChatChange} />
              {currentChat === undefined ? (
                <Welcome />
              ) : (
                <ChatContainer currentChat={currentChat} socket={socket} />
              )}
            </>
          )}
        </div>
      </Container>
    </>
  );
}

// background-color: #172e2b;
// background-color: #0c1715;
const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: transparent;
  gap: 1rem;
  align-items: center;

  .container {
    height: 99vh;
    width: 98vw;
    background: #181818;
    box-shadow: 0 8px 32px 0 #00fff733;
    border-radius: 24px;
    display: grid;
    grid-template-columns: 25% 75%;
    border: 1.5px solid #00fff7;
    backdrop-filter: blur(8px);
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 45% 55%;
    }
    @media screen and (max-width: 719px) {
      display: flex;
      flex-direction: column;
      width: 100vw;
      height: 100vh;
      min-height: 100vh;
      max-height: 100vh;
      border-radius: 0;
      box-shadow: none;
      border: none;
      padding: 0;
      background: #181818;
    }
  }
  @media screen and (max-width: 719px) {
    height: 100vh;
    width: 100vw;
    min-height: 100vh;
    max-height: 100vh;
    gap: 0;
    align-items: stretch;
    justify-content: stretch;
    .container > div, .container > .contacts {
      height: 100vh !important;
      min-height: 100vh !important;
      max-height: 100vh !important;
      width: 100vw !important;
      min-width: 100vw !important;
      max-width: 100vw !important;
    }
  }
`;




