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
                <UserAvatar image={user.avatarImage} />
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
  background: #292B36;
  color: white;
  .profile-avatar {
    margin-bottom: 2rem;
  }
  .profile-info {
    h2 {
      margin-bottom: 1rem;
    }
    p {
      color: #bbb;
    }
  }
`; 