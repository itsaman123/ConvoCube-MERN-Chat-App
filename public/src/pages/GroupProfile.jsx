import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import UserAvatar from "../components/UserAvatar";
import { getGroupByIdRoute } from "../utils/APIRoutes";
import { FaArrowLeft, FaUsers, FaCalendar, FaCrown, FaComments, FaClock } from "react-icons/fa";

export default function GroupProfile() {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchGroup() {
            try {
                setLoading(true);
                const res = await axios.get(`${getGroupByIdRoute}/${groupId}`);
                setGroup(res.data);
            } catch (err) {
                console.error("Error fetching group:", err);
                setGroup(null);
            } finally {
                setLoading(false);
            }
        }
        fetchGroup();
    }, [groupId]);

    const handleBack = () => {
        navigate(-1);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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

    if (loading) {
        return (
            <Container>
                <div className="loading">
                    <h2>Loading group profile...</h2>
                </div>
            </Container>
        );
    }

    if (!group) {
        return (
            <Container>
                <div className="error">
                    <h2>Group not found</h2>
                    <button onClick={handleBack} className="back-btn">
                        <FaArrowLeft /> Go Back
                    </button>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="header">
                <button onClick={handleBack} className="back-btn">
                    <FaArrowLeft /> Back
                </button>
            </div>

            <div className="profile-avatar">
                <UserAvatar
                    image={group.avatar || generateGroupAvatar(group.name)}
                    name={group.name}
                />
            </div>

            <div className="profile-info">
                <h2>{group.name}</h2>

                <div className="info-item">
                    <FaUsers className="icon" />
                    <span>{group.members?.length || 0} members</span>
                </div>

                <div className="info-item">
                    <FaComments className="icon" />
                    <span>{group.messageCount || 0} messages</span>
                </div>

                <div className="info-item">
                    <FaCalendar className="icon" />
                    <span>Created on {formatDate(group.createdAt)}</span>
                </div>

                {group.lastMessage && (
                    <div className="info-item">
                        <FaClock className="icon" />
                        <div className="last-message">
                            <span className="last-message-text">"{group.lastMessage.text}"</span>
                            <span className="last-message-time">{formatDate(group.lastMessage.createdAt)}</span>
                        </div>
                    </div>
                )}

                {group.createdBy && (
                    <div className="info-item">
                        <FaCrown className="icon" />
                        <span>Created by {group.createdBy.username}</span>
                    </div>
                )}
            </div>

            <div className="members-section">
                <h3>Group Members</h3>
                <div className="members-list">
                    {group.members?.map((member) => (
                        <div key={member._id} className="member-item">
                            <UserAvatar image={member.avatarImage} name={member.username} />
                            <div className="member-info">
                                <span className="member-name">{member.username}</span>
                                <span className="member-email">{member.email}</span>
                            </div>
                            {group.createdBy && member._id === group.createdBy._id && (
                                <div className="admin-badge">
                                    <FaCrown />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  background: #000000;
  color: #ffffff;
  padding: 2rem;
  box-sizing: border-box;

  .header {
    width: 100%;
    max-width: 600px;
    margin-bottom: 2rem;
    
    .back-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #8E75F0;
      border: none;
      color: #ffffff;
      padding: 0.7rem 1.2rem;
      border-radius: 0.7rem;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
      
      &:hover {
        background: #7A5FD0;
        transform: translateY(-2px);
      }
    }
  }

  .loading, .error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    gap: 1rem;
    
    h2 {
      color: #ffffff;
      font-weight: 700;
    }
  }

  .profile-avatar {
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px 0 #8E75F044;
    border-radius: 50%;
    background: #333;
    padding: 1.5rem;
  }

  .profile-info {
    width: 100%;
    max-width: 600px;
    margin-bottom: 3rem;
    
    h2 {
      margin-bottom: 1.5rem;
      color: #ffffff;
      font-weight: 700;
      letter-spacing: 2px;
      text-align: center;
      font-size: 2rem;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #111;
      padding: 1rem 1.5rem;
      border-radius: 0.7rem;
      margin-bottom: 1rem;
      box-shadow: 0 1px 4px 0 #8E75F044;
      
      .icon {
        color: #8E75F0;
        font-size: 1.2rem;
        flex-shrink: 0;
      }
      
      span {
        color: #ffffff;
        font-size: 1.1rem;
      }

      .last-message {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        flex: 1;
        
        .last-message-text {
          color: #ffffff;
          font-size: 1rem;
          font-style: italic;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .last-message-time {
          color: #cccccc;
          font-size: 0.9rem;
        }
      }
    }
  }

  .members-section {
    width: 100%;
    max-width: 600px;
    
    h3 {
      color: #ffffff;
      font-weight: 700;
      margin-bottom: 1.5rem;
      text-align: center;
      font-size: 1.5rem;
    }

    .members-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .member-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #111;
      padding: 1rem 1.5rem;
      border-radius: 0.7rem;
      box-shadow: 0 1px 4px 0 #8E75F044;
      position: relative;
      
      .member-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        
        .member-name {
          color: #ffffff;
          font-weight: 600;
          font-size: 1.1rem;
        }
        
        .member-email {
          color: #cccccc;
          font-size: 0.9rem;
        }
      }
      
      .admin-badge {
        color: #FFD700;
        font-size: 1.2rem;
        margin-left: auto;
      }
    }
  }

  @media screen and (max-width: 719px) {
    padding: 1rem;
    
    .profile-info h2 {
      font-size: 1.5rem;
    }
    
    .members-section h3 {
      font-size: 1.3rem;
    }
    
    .member-item {
      padding: 0.8rem 1rem;
      
      .member-info .member-name {
        font-size: 1rem;
      }
      
      .member-info .member-email {
        font-size: 0.8rem;
      }
    }
  }
`; 