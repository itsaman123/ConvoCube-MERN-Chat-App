import React from "react";
import styled from "styled-components";

const UserAvatar = ({ image }) => {
  return (
    <AvatarContainer>
      <img src={image} alt="avatar" />
    </AvatarContainer>
  );
};

const AvatarContainer = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #4e0eff;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export default UserAvatar;
