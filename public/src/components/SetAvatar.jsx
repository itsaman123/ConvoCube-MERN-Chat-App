import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import loader from "../assets/loader.gif";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { setAvatarRoute } from "../utils/APIRoutes";

export default function SetAvatar() {
  const api = `https://api.multiavatar.com`;
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 5000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(() => {
    const checkUser = async () => {
      const user = localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY);
      if (!user) navigate("/login");
    };
    checkUser();
  }, [navigate]);

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));

      const { data } = await axios.post(`${setAvatarRoute}/${user._id}`, {
        image: avatars[selectedAvatar],
      });

      if (data.isSet) {
        user.isAvatarImageSet = true;
        user.avatarImage = data.image;
        localStorage.setItem(process.env.REACT_APP_LOCALHOST_KEY, JSON.stringify(user));
        navigate("/");
      } else {
        toast.error("Error setting avatar. Please try again.", toastOptions);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.", toastOptions);
    }
  };

  // useEffect(() => {
  //   const fetchAvatars = async () => {
  //     try {
  //       toast.error("Multiavatar API is not working. Using fallback avatars.", toastOptions);

  //       // Fallback logic using ui-avatars.com
  //       const fallbackAvatars = ['A', 'B', 'C', 'D', 'E'].map(char => `https://ui-avatars.com/api/?name=${char}`);
  //       setAvatars(fallbackAvatars.slice(0, 4));
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchAvatars();
  // }, []);

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        // Fallback logic using ui-avatars.com
        const fallbackAvatars = ['User A', 'User B', 'User C', 'User D', 'User E'].map(name => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&rounded=true`);
        setAvatars(fallbackAvatars);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvatars();
  }, []);






  return (
    <>
      {isLoading ? (
        <Container>
          <img src={loader} alt="loader" className="loader" />
        </Container>
      ) : (
        <Container>
          <div className="title-container">
            <h1>Pick an Avatar as your profile picture</h1>
          </div>
          <div className="avatars">
            {avatars.map((avatar, index) => (
              <div
                key={index}
                className={`avatar ${selectedAvatar === index ? "selected" : ""}`}
                onClick={() => setSelectedAvatar(index)}
              >
                <img src={avatar} alt="avatar" />
              </div>
            ))}
          </div>

          <button onClick={setProfilePicture} className="submit-btn">
            Set as Profile Picture
          </button>
          <ToastContainer />
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 3rem;
  background: #111;
  height: 100vh;
  width: 100vw;

  .loader {
    max-inline-size: 100%;
  }

  .title-container {
    h1 {
      color: #00fff7;
      font-weight: 700;
      letter-spacing: 2px;
    }
  }
  .avatars {
    display: flex;
    gap: 2rem;

    .avatar {
      border: 0.4rem solid transparent;
      padding: 0.4rem;
      border-radius: 5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.3s box-shadow, 0.3s border;
      cursor: pointer;
      background: #222;
      box-shadow: 0 2px 8px 0 #00fff744;

      img {
        height: 6rem;
        transition: 0.3s box-shadow, 0.3s border;
      }
    }
    .selected {
      border: 0.4rem solid #00fff7;
      box-shadow: 0 4px 16px 0 #00fff744;
    }
  }
  .submit-btn {
    background: linear-gradient(90deg, #00fff7 0%, #222 100%);
    color: #111;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.7rem;
    font-size: 1rem;
    text-transform: uppercase;
    box-shadow: 0 2px 8px 0 #00fff744;
    transition: background 0.2s;
    &:hover {
      background: linear-gradient(90deg, #222 0%, #00fff7 100%);
    }
  }
`;
