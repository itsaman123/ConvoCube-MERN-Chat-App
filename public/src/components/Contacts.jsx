import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Logo from "../assets/logo.png";
import UserAvatar from "./UserAvatar";
import { FaThumbtack } from "react-icons/fa";
import axios from "axios";
import { host, createGroupRoute, getUserGroupsRoute } from "../utils/APIRoutes";
import { useNavigate } from "react-router-dom";

export default function Contacts({ contacts, changeChat }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const [pinnedContacts, setPinnedContacts] = useState([]);
  const [unpinnedContacts, setUnpinnedContacts] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(async () => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    setCurrentUserName(data.username);
    setCurrentUserImage(data.avatarImage);
  }, []);

  useEffect(() => {
    // Separate contacts into pinned and unpinned
    const pinned = contacts.filter(contact => contact.isPinned);
    const unpinned = contacts.filter(contact => !contact.isPinned);
    setPinnedContacts(pinned);
    setUnpinnedContacts(unpinned);
  }, [contacts]);

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

  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };

  const handlePinToggle = async (e, contact) => {
    e.stopPropagation();
    try {
      const data = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );
      const response = await axios.post(`${host}/api/messages/togglepin`, {
        userId: contact._id,
        contactId: data._id
      });
      const updatedContacts = contacts.map(c => {
        if (c._id === contact._id) {
          return { ...c, isPinned: response.data.isPinned };
        }
        return c;
      });
      const pinned = updatedContacts.filter(c => c.isPinned);
      const unpinned = updatedContacts.filter(c => !c.isPinned);
      setPinnedContacts(pinned);
      setUnpinnedContacts(unpinned);
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
    } catch (err) {
      alert("Failed to create group");
    } finally {
      setCreatingGroup(false);
    }
  };

  const renderContact = (contact, index) => (
    <div
      key={contact._id}
      className={`contact ${index === currentSelected ? "selected" : ""}`}
      onClick={() => changeCurrentChat(index, contact)}
    >
      <UserAvatar image={contact.avatarImage} />
      <div className="username">
        <h3>{contact.username}</h3>
      </div>
      <button
        className="pin-button"
        onClick={(e) => handlePinToggle(e, contact)}
      >
        <FaThumbtack className={contact.isPinned ? "pinned" : ""} />
      </button>
    </div>
  );

  const renderGroup = (group, index) => (
    <div
      key={group._id}
      className="contact"
      onClick={() => changeCurrentChat(index, { ...group, isGroup: true })}
      style={{ background: '#222', border: '0.07rem solid #00fff7', borderRadius: '1rem', marginBottom: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.7rem', padding: '0.5rem 1rem' }}
    >
      <UserAvatar image={group.avatar || Logo} />
      <div className="username">
        <h3>{group.name}</h3>
      </div>
      <span style={{ color: '#00fff7', fontSize: '0.8rem', marginLeft: 'auto', fontWeight: 600 }}>Group</span>
    </div>
  );

  return (
    <>
      {currentUserImage && currentUserImage && (
        <Container>
          <div className="brand" style={{ position: 'relative' }}>
            <img src={Logo} alt="logo" />
            <h3>Convocube</h3>
            <button
              style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'linear-gradient(90deg, #00fff7 0%, #222 100%)',
                color: '#111',
                padding: '0.3rem 0.7rem',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.85rem',
                boxShadow: '0 2px 8px 0 #00fff744',
                textTransform: 'uppercase',
                zIndex: 2,
              }}
              onClick={() => setShowCreateGroup(true)}
            >
              + Group
            </button>
          </div>
          <div className="contacts">
            {groups.length > 0 && (
              <div className="section">
                <h4>Groups</h4>
                {groups.map((group, index) => renderGroup(group, index))}
              </div>
            )}
            {pinnedContacts.length > 0 && (
              <div className="section">
                <h4>Pinned Chats</h4>
                {pinnedContacts.map((contact, index) => renderContact(contact, index))}
              </div>
            )}
            {unpinnedContacts.length > 0 && (
              <div className="section">
                <h4>Recent Chats</h4>
                {unpinnedContacts.map((contact, index) => renderContact(contact, index))}
              </div>
            )}
          </div>
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
                background: '#181818',
                padding: '2rem',
                borderRadius: '1rem',
                minWidth: '320px',
                boxShadow: '0 4px 24px 0 #00fff733',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                alignItems: 'center',
                maxHeight: '80vh',
                overflowY: 'auto',
              }}>
                <h2 style={{ color: '#00fff7', marginBottom: '1rem' }}>Create Group</h2>
                <input
                  type="text"
                  placeholder="Group Name"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  style={{
                    padding: '0.7rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #00fff7',
                    background: '#222',
                    color: '#00fff7',
                    width: '100%',
                  }}
                  disabled={creatingGroup}
                />
                <div style={{ width: '100%', margin: '1rem 0' }}>
                  <div style={{ color: '#00fff7', marginBottom: '0.5rem', fontWeight: 600 }}>Select Members:</div>
                  <div style={{ maxHeight: '180px', overflowY: 'auto', background: '#222', borderRadius: '0.5rem', padding: '0.5rem' }}>
                    {unpinnedContacts.concat(pinnedContacts).map((contact) => (
                      <label key={contact._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00fff7', marginBottom: '0.3rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(contact._id)}
                          onChange={() => handleToggleMember(contact._id)}
                          disabled={creatingGroup}
                          style={{ accentColor: '#00fff7' }}
                        />
                        <UserAvatar image={contact.avatarImage} />
                        <span>{contact.username}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    style={{
                      background: 'linear-gradient(90deg, #00fff7 0%, #222 100%)',
                      color: '#111',
                      padding: '0.7rem 1.5rem',
                      border: 'none',
                      borderRadius: '0.7rem',
                      fontWeight: 'bold',
                      cursor: selectedMembers.length === 0 || creatingGroup ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      boxShadow: '0 2px 8px 0 #00fff744',
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
                      background: '#222',
                      color: '#00fff7',
                      padding: '0.7rem 1.5rem',
                      border: '1px solid #00fff7',
                      borderRadius: '0.7rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      boxShadow: '0 2px 8px 0 #00fff744',
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
            <UserAvatar image={currentUserImage} onClick={handleCurrentUserProfile} />
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
  background: #181818;
  border-radius: 20px 0 0 20px;
  box-shadow: 0 4px 24px 0 #00fff733;
  border-right: 2px solid #00fff7;
  overflow: hidden;
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img {
      height: 2rem;
    }
    h3 {
      color: #00fff7;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 700;
    }
  }
  @media screen and (min-width: 390px) and (max-width: 719px) {
    .brand {
      h3 {
        display:none;
      }
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
        background-color: #00fff7;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .section {
      width: 100%;
      h4 {
        color: #00fff7;
        font-size: 0.8rem;
        margin: 0.5rem 1rem;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    }
    .contact {
      background: #222;
      min-height: 3.2rem;
      cursor: pointer;
      width: 90%;
      border: 0.07rem solid #00fff7;
      border-radius: 1rem;
      display: flex;
      gap: .7rem;
      overflow:hidden;
      align-items: center;
      transition: 0.2s box-shadow, 0.2s background;
      position: relative;
      box-shadow: 0 2px 8px 0 #00fff722;
      .avatar {
        img {
          height: 2.5rem;
        }
      }
      .username {
        h3 {
          color: #00fff7;
          font-size: .95rem;
        }
      }
      &:hover {
        background: #111;
        box-shadow: 0 4px 16px 0 #00fff744;
      }
      .pin-button {
        position: absolute;
        right: 0.5rem;
        background: none;
        border: none;
        color: #00fff7;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s ease;
        padding: 0.5rem;
        svg {
          font-size: 1rem;
          &.pinned {
            color: #00fff7;
            transform: rotate(45deg);
          }
        }
      }
      &:hover .pin-button {
        opacity: 1;
      }
    }
    .selected {
      background: linear-gradient(90deg, #00fff7 0%, #222 100%);
      color: #111;
      .username h3 {
        color: #111;
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
        color: #00fff7;
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
`;
