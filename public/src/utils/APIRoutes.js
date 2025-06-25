export const host =
    typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000'
        : 'https://convo-cube-chat.vercel.app';
// export const host = "https://convo-cube-chat.vercel.app";
console.log(window.location)
export const loginRoute = `${host}/api/auth/login`;
export const registerRoute = `${host}/api/auth/register`;
export const logoutRoute = `${host}/api/auth/logout`;
export const allUsersRoute = `${host}/api/auth/allusers`;
export const sendMessageRoute = `${host}/api/messages/addmsg`;
export const recieveMessageRoute = `${host}/api/messages/getmsg`;
export const setAvatarRoute = `${host}/api/auth/setavatar`;
export const togglePinRoute = `${host}/api/messages/togglepin`;
export const createGroupRoute = `${host}/api/auth/group`;
export const getUserGroupsRoute = `${host}/api/auth/groups`;
