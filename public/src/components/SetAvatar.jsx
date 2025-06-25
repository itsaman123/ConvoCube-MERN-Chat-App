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
  const [username, setUsername] = useState("");

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
      else {
        const userData = JSON.parse(user);
        setUsername(userData.username);
      }
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

  // Function to get first 2 unique characters from username
  const getFirstTwoUniqueChars = (name) => {
    if (!name || name.length === 0) return "U";
    const chars = name.split('').filter((char, index, arr) => arr.indexOf(char) === index);
    return chars.slice(0, 2).join('').toUpperCase() || name.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        if (username) {
          // Generate avatars based on username with different color combinations
          const baseChars = getFirstTwoUniqueChars(username);
          const colorCombinations = [
            { bg: 'random', color: 'fff' },
            { bg: '00fff7', color: '111' },
            { bg: 'ff6b6b', color: 'fff' },
            { bg: '4ecdc4', color: 'fff' },
            { bg: '45b7d1', color: 'fff' },
            { bg: '96ceb4', color: 'fff' },
            // { bg: 'feca57', color: '111' },
            // { bg: 'ff9ff3', color: '111' },
            // { bg: '54a0ff', color: 'fff' },
            // { bg: '5f27cd', color: 'fff' }
          ];

          const generatedAvatars = colorCombinations.map(combo =>
            `https://ui-avatars.com/api/?name=${encodeURIComponent(baseChars)}&background=${combo.bg}&color=${combo.color}&rounded=true&size=200&font-size=0.4&bold=true`
          );

          setAvatars(generatedAvatars);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvatars();
  }, [username]);

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
