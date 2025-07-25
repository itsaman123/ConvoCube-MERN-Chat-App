import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Logo from "../assets/logo.png";
import UserAvatar from "./UserAvatar";
import { FaThumbtack, FaPlus } from "react-icons/fa";
import axios from "axios";
import { host, createGroupRoute, getUserGroupsRoute } from "../utils/APIRoutes";
import { useNavigate } from "react-router-dom";

export default function Contacts({ contacts, changeChat }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const [allChats, setAllChats] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [pinnedChats, setPinnedChats] = useState([]);
  const [showContactsList, setShowContactsList] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const data = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );
      setCurrentUserName(data.username);
      setCurrentUserImage(data.avatarImage);
      setPinnedChats(data.pinnedChats || []);
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      const user = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
      if (!user) return;
      try {
        const res = await axios.get(`${getUserGroupsRoute}/${user._id}`);
        setGroups(res.data || []);
      } catch (err) {
        setGroups([]);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    // Merge contacts and groups into a single list
    const groupChats = groups.map(g => ({
      ...g,
      isGroup: true,
      avatarImage: g.avatar || generateGroupAvatar(g.name),
      username: g.name,
      members: g.members,
      chatId: g._id,
      chatType: 'group',
    }));
    const individualChats = contacts.map(c => ({
      ...c,
      isGroup: false,
      chatId: c._id,
      chatType: 'user',
    }));
    const merged = [...groupChats, ...individualChats];
    // Mark pinned status
    const user = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
    const pinned = (user?.pinnedChats || []);
    merged.forEach(chat => {
      chat.isPinned = pinned.some(p => p.chatId === chat.chatId && p.type === chat.chatType);
    });
    // Sort: pinned first, then recent
    merged.sort((a, b) => (b.isPinned - a.isPinned));
    setAllChats(merged);
  }, [contacts, groups]);

  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
    // On mobile, hide contacts and show chat only
    if (window.innerWidth <= 719) {
      setShowContactsList(false);
    }
  };

  const handlePinToggle = async (e, chat) => {
    e.stopPropagation();
    try {
      const data = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );
      const response = await axios.post(`${host}/api/messages/togglepin`, {
        userId: data._id,
        chatId: chat.chatId,
        chatType: chat.chatType
      });
      // Update pinnedChats in localStorage and state
      data.pinnedChats = response.data.pinnedChats;
      localStorage.setItem(process.env.REACT_APP_LOCALHOST_KEY, JSON.stringify(data));
      setPinnedChats(response.data.pinnedChats);
      // Update allChats to reflect new pin status
      setAllChats(prev => prev.map(c =>
        c.chatId === chat.chatId && c.chatType === chat.chatType
          ? { ...c, isPinned: response.data.isPinned }
          : c
      ).sort((a, b) => (b.isPinned - a.isPinned)));
    } catch (error) {
      console.error("Error toggling pin status:", error);
    }
  };

  const handleCurrentUserProfile = () => {
    const data = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
    navigate(`/profile/${data._id}`);
  };

  const handleToggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) return;
    setCreatingGroup(true);
    try {
      const user = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
      const res = await axios.post(createGroupRoute, {
        name: groupName,
        members: [user._id, ...selectedMembers],
        createdBy: user._id,
        avatar: "",
      });
      setShowCreateGroup(false);
      setGroupName("");
      setSelectedMembers([]);
      // Refresh groups after creation
      const groupRes = await axios.get(`${getUserGroupsRoute}/${user._id}`);
      setGroups(groupRes.data || []);
      // Auto-select the new group
      if (groupRes.data && groupRes.data.length > 0) {
        const newGroup = groupRes.data[groupRes.data.length - 1];
        changeCurrentChat(groups.length, {
          ...newGroup,
          isGroup: true,
          avatarImage: newGroup.avatar || generateGroupAvatar(newGroup.name),
          username: newGroup.name,
          members: newGroup.members,
        });
      }
    } catch (err) {
      alert("Failed to create group");
    } finally {
      setCreatingGroup(false);
    }
  };

  // Function to get first 2 unique characters from name
  const getFirstTwoUniqueChars = (name) => {
    if (!name || name.length === 0) return "G";
    const chars = name.split('').filter((char, index, arr) => arr.indexOf(char) === index);
    return chars.slice(0, 2).join('').toUpperCase() || name.slice(0, 2).toUpperCase();
  };

  // Function to generate group avatar URL
  const generateGroupAvatar = (groupName) => {
    const baseChars = getFirstTwoUniqueChars(groupName);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(baseChars)}&background=8E75F0&color=ffffff&rounded=true&size=200&font-size=0.4&bold=true`;
  };

  const renderChat = (chat, index) => (
    <div
      key={chat.chatId}
      className={`contact ${index === currentSelected ? "selected" : ""}`}
      onClick={() => changeCurrentChat(index, chat)}
    >
      <UserAvatar image={chat.avatarImage} name={chat.isGroup ? chat.username : chat.username} />
      <div className="username">
        <h3>{chat.isGroup ? chat.username : chat.username}</h3>
      </div>
      <button
        className="pin-button"
        onClick={(e) => handlePinToggle(e, chat)}
        title={chat.isPinned ? "Unpin" : "Pin"}
      >
        <FaThumbtack className={chat.isPinned ? "pinned" : ""} />
      </button>

    </div>
  );

  // Back button handler for mobile
  const handleBackToContacts = () => {
    setShowContactsList(true);
  };

  return (
    <>
      {currentUserImage && (
        <Container showContactsList={showContactsList}>
          {/* Show back button on mobile when in chat view */}
          {window.innerWidth <= 719 && !showContactsList && (
            <button className="back-btn" onClick={handleBackToContacts}>
              &#8592; Contacts
            </button>
          )}
          {/* Contacts List */}
          <div className="brand" style={{ display: (window.innerWidth <= 719 && !showContactsList) ? 'none' : undefined }}>
            <h3>Convocube</h3>
          </div>
          <div className="contacts" style={{ display: (window.innerWidth <= 719 && !showContactsList) ? 'none' : undefined }}>
            {(() => {
              const pinnedChats = allChats.filter(chat => chat.isPinned);
              const recentChats = allChats.filter(chat => !chat.isPinned);
              return (
                <>
                  {pinnedChats.length > 0 && (
                    <div className="section">
                      <h4>Pinned Chats</h4>
                      {pinnedChats.map((chat, index) => renderChat(chat, index))}
                    </div>
                  )}
                  {recentChats.length > 0 && (
                    <div className="section">
                      <h4>Recent Chats</h4>
                      {recentChats.map((chat, index) => renderChat(chat, index))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          {/* Floating Create Group Button (hide on chat view in mobile) */}
          {(!window.innerWidth <= 719 || showContactsList) && (
            <button
              className="floating-create-btn"
              onClick={() => setShowCreateGroup(true)}
              title="Create Group"
            >
              <FaPlus />
            </button>
          )}
          {showCreateGroup && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}>
              <div style={{
                background: '#000000',
                padding: '2rem',
                borderRadius: '1rem',
                minWidth: '320px',
                boxShadow: '0 4px 24px 0 #8E75F033',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                alignItems: 'center',
                maxHeight: '80vh',
                overflowY: 'auto',
              }}>
                <h2 style={{ color: '#ffffff', marginBottom: '1rem' }}>Create Group</h2>
                <input
                  type="text"
                  placeholder="Group Name"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  style={{
                    padding: '0.7rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #8E75F0',
                    background: '#333',
                    color: '#ffffff',
                    width: '100%',
                  }}
                  disabled={creatingGroup}
                />
                <div style={{ width: '100%', margin: '1rem 0' }}>
                  <div style={{ color: '#ffffff', marginBottom: '0.5rem', fontWeight: 600 }}>Select Members:</div>
                  <div style={{ maxHeight: '180px', overflowY: 'auto', background: '#333', borderRadius: '0.5rem', padding: '0.5rem' }}>
                    {allChats.filter(chat => !chat.isGroup).map((chat) => (
                      <label key={chat.chatId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', marginBottom: '0.3rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(chat.chatId)}
                          onChange={() => handleToggleMember(chat.chatId)}
                          disabled={creatingGroup}
                          style={{ accentColor: '#8E75F0' }}
                        />
                        <UserAvatar image={chat.avatarImage} name={chat.username} />
                        <span>{chat.isGroup ? chat.username : chat.username}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    style={{
                      background: '#8E75F0',
                      color: '#ffffff',
                      padding: '0.7rem 1.5rem',
                      border: 'none',
                      borderRadius: '0.7rem',
                      fontWeight: 'bold',
                      cursor: selectedMembers.length === 0 || creatingGroup ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      boxShadow: '0 2px 8px 0 #8E75F044',
                      textTransform: 'uppercase',
                      opacity: creatingGroup || selectedMembers.length === 0 ? 0.7 : 1,
                    }}
                    onClick={handleCreateGroup}
                    disabled={creatingGroup || selectedMembers.length === 0}
                  >
                    {creatingGroup ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    style={{
                      background: '#333',
                      color: '#ffffff',
                      padding: '0.7rem 1.5rem',
                      border: '1px solid #8E75F0',
                      borderRadius: '0.7rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      boxShadow: '0 2px 8px 0 #8E75F044',
                      textTransform: 'uppercase',
                    }}
                    onClick={() => { setShowCreateGroup(false); setGroupName(""); setSelectedMembers([]); }}
                    disabled={creatingGroup}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="current-user">
            <UserAvatar image={currentUserImage} onClick={handleCurrentUserProfile} name={currentUserName} />
            <div className="username">
              <h2>{currentUserName}</h2>
            </div>
          </div>
        </Container>
      )}
    </>
  );
}
// background-color: #172e2b;
const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 75% 15%;
  background: #000000;
  border-radius: 20px 0 0 20px;
  box-shadow: 0 4px 24px 0 #8E75F033;
  border-right: 2px solid #8E75F0;
  overflow: hidden;
  position: relative;
  
  .floating-create-btn {
    position: absolute;
    bottom: 6rem;
    right: 1rem;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    background: #8E75F0;
    border: 2px solid #8E75F0;
    color: #ffffff;
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px 0 #8E75F044;
    transition: all 0.3s ease;
    z-index: 10;
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px 0 #8E75F066;
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
  
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img {
      height: 2rem;
    }
    h3 {
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 700;
    }
  }
  @media screen and (min-width: 390px) and (max-width: 719px) {
    .brand {
      width: 100%;
      justify-content: center;
      align-items: center;
      display: flex;
      margin-bottom: 0.3rem;
      padding: 0.3rem 0 0.1rem 0;
      h3 {
        font-size: 1.3rem;
        text-align: center;
        width: 100%;
        margin: 0 auto;
      }
    }
    .contacts {
      padding: 0.2rem 0 0.5rem 0;
      gap: 0.4rem;
    }
  }
  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0.8rem;
    padding: 1rem 0;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #8E75F0;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .section {
      width: 100%;
      h4 {
        color: #ffffff;
        font-size: 0.8rem;
        margin: 0.5rem 1rem;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    }
    .contact {
      margin: .5rem 0 0 1.2rem; 
      background: #333;
      min-height: 3.2rem;
      cursor: pointer;
      width: 90%;
      border: 0.07rem solid #8E75F0;
      border-radius: 1rem;
      display: flex;
      gap: .9rem;
      overflow:hidden;
      align-items: center;
      transition: 0.2s box-shadow, 0.2s background;
      position: relative;
      box-shadow: 0 2px 8px 0 #8E75F022;
      .avatar {
        img {
          height: 2.2rem;
        }
      }
      .username {
        h3 {
          color: #ffffff;
          font-size: .95rem;
        }
      }
      &:hover {
        box-shadow: 0 4px 16px 0 #8E75F044;
      }
      .pin-button {
        position: absolute;
        right: 0.5rem;
        background: none;
        border: none;
        color: #ffffff;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s ease;
        padding: 0.5rem;
        svg {
          font-size: 1rem;
          &.pinned {
            color: #8E75F0;
            transform: rotate(45deg);
          }
        }
      }
      &:hover .pin-button {
        opacity: 1;
      }
    }
    .selected {
      background: #8E75F0;
      color: #ffffff;
      .username h3 {
        color: #ffffff;
      }
    }
  }
  .current-user {
    background: #111;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    border-radius: 0 0 20px 20px;
    .avatar {
      img {
        height: 4rem;
        max-inline-size: 100%;
      }
    }
    .username {
      h2 {
        color: #ffffff;
        font-size: 1.2rem;
      }
    }
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      gap: 0.5rem;
      .username {
        h2 {
          font-size: 1rem;
        }
      }
    }
  }
  @media screen and (min-width: 390px) and (max-width: 719px) {
    .avatar {
      img {
        height: 4rem;
        max-inline-size: 65%;
      }
    }
    .username {
      h2 {
        display:none;
      }
    }
  }
  .back-btn {
    display: none;
    position: absolute;
    top: 1rem;
    left: 1rem;
    z-index: 20;
    background: #8E75F0;
    color: #ffffff;
    border: none;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 2px 8px 0 #8E75F044;
  }
  @media screen and (max-width: 719px) {
    .back-btn {
      display: block;
    }
    .brand, .contacts, .floating-create-btn {
      display: ${({ showContactsList }) => showContactsList ? 'block' : 'none'};
    }
  }
`;
