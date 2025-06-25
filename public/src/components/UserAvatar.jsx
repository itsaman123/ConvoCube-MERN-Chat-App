import React from "react";
import styled from "styled-components";

const UserAvatar = ({ image, onClick, name }) => {
  // Function to get first 2 unique characters from name
  const getFirstTwoUniqueChars = (name) => {
    if (!name || name.length === 0) return "U";
    const chars = name.split('').filter((char, index, arr) => arr.indexOf(char) === index);
    return chars.slice(0, 2).join('').toUpperCase() || name.slice(0, 2).toUpperCase();
  };

  // Generate fallback avatar if no image is provided
  const getFallbackAvatar = () => {
    const initials = getFirstTwoUniqueChars(name || "User");
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=00fff7&color=111&rounded=true&size=200&font-size=0.4&bold=true`;
  };

  const avatarSrc = image || getFallbackAvatar();

  return (
    <AvatarContainer
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      style={onClick ? { cursor: "pointer" } : {}}
      aria-label={onClick ? "View profile" : undefined}
    >
      <img src={avatarSrc} alt="avatar" />
    </AvatarContainer>
  );
};

const AvatarContainer = styled.div`
  width: 41px;
  height: 41px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2.5px solid #00fff7;
  background: #111;
  box-shadow: 0 2px 8px 0 #00fff744;
  margin-left: 0.5rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export default UserAvatar;
