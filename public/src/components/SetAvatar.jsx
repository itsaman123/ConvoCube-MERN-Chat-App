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
            { bg: '8E75F0', color: 'ffffff' },
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
  background: #000000;
  height: 100vh;
  width: 100vw;
  padding: 1rem;
  box-sizing: border-box;

  .loader {
    max-inline-size: 100%;
  }

  .title-container {
    text-align: center;
    padding: 0 1rem;
    
    h1 {
      color: #ffffff;
      font-weight: 700;
      letter-spacing: 2px;
      font-size: 2rem;
      line-height: 1.2;
      margin: 0;
      
      @media (max-width: 768px) {
        font-size: 1.5rem;
        letter-spacing: 1px;
      }
      
      @media (max-width: 480px) {
        font-size: 1.2rem;
        letter-spacing: 0.5px;
      }
    }
  }
  
  .avatars {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 100%;
    padding: 0 1rem;

    @media (max-width: 768px) {
      gap: 1.5rem;
    }
    
    @media (max-width: 480px) {
      gap: 1rem;
    }

    .avatar {
      border: 0.4rem solid transparent;
      padding: 0.4rem;
      border-radius: 5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.3s box-shadow, 0.3s border;
      cursor: pointer;
      background: #333;
      box-shadow: 0 2px 8px 0 #8E75F044;
      flex-shrink: 0;

      @media (max-width: 768px) {
        border-width: 0.3rem;
        padding: 0.3rem;
      }
      
      @media (max-width: 480px) {
        border-width: 0.25rem;
        padding: 0.25rem;
      }

      img {
        height: 6rem;
        transition: 0.3s box-shadow, 0.3s border;
        
        @media (max-width: 768px) {
          height: 5rem;
        }
        
        @media (max-width: 480px) {
          height: 4rem;
        }
      }
    }
    
    .selected {
      border: 0.4rem solid #8E75F0;
      box-shadow: 0 4px 16px 0 #8E75F044;
      
      @media (max-width: 768px) {
        border-width: 0.3rem;
      }
      
      @media (max-width: 480px) {
        border-width: 0.25rem;
      }
    }
  }
  
  .submit-btn {
    background: #8E75F0;
    color: #ffffff;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.7rem;
    font-size: 1rem;
    text-transform: uppercase;
    box-shadow: 0 2px 8px 0 #8E75F044;
    transition: background 0.2s;
    min-width: 200px;
    
    @media (max-width: 768px) {
      padding: 0.8rem 1.5rem;
      font-size: 0.9rem;
      min-width: 180px;
    }
    
    @media (max-width: 480px) {
      padding: 0.7rem 1.2rem;
      font-size: 0.8rem;
      min-width: 160px;
    }
    
    &:hover {
      background: #7A5FD0;
    }
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  @media (max-width: 768px) {
    gap: 2rem;
    padding: 0.5rem;
  }
  
  @media (max-width: 480px) {
    gap: 1.5rem;
    padding: 0.25rem;
  }
`;
