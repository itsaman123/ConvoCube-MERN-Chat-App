import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import axios from "axios";
import UserAvatar from "../components/UserAvatar";
import { host } from "../utils/APIRoutes";

export default function Profile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get(`${host}/api/auth/user/${userId}`);
        setUser(res.data);
      } catch (err) {
        setUser(null);
      }
    }
    fetchUser();
  }, [userId]);

  if (!user) return <Container><h2>Loading profile...</h2></Container>;

  return (
    <Container>
      <div className="profile-avatar">
        <UserAvatar image={user.avatarImage} name={user.username} />
      </div>
      <div className="profile-info">
        <h2>{user.username}</h2>
        <p>Email: {user.email}</p>
      </div>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #000000;
  color: #ffffff;
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 #8E75F033;
  .profile-avatar {
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px 0 #8E75F044;
    border-radius: 50%;
    background: #333;
    padding: 1.5rem;
  }
  .profile-info {
    h2 {
      margin-bottom: 1rem;
      color: #ffffff;
      font-weight: 700;
      letter-spacing: 2px;
    }
    p {
      color: #ffffff;
      font-size: 1.1rem;
      background: #111;
      padding: 0.7rem 1.2rem;
      border-radius: 0.7rem;
      margin-top: 0.5rem;
      box-shadow: 0 1px 4px 0 #8E75F044;
    }
  }
`; 