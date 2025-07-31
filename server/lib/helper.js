

export const getOtherMember = (members, userId) => {
  return members.find((member) => member._id.toString() !== userId.toString());
};

//get Sockets
export const getSocket = (users) => {
  // Ensure users is defined and is an array before calling map
  if (!Array.isArray(users)) {
    console.error("Invalid users data:", users);
    return []; // Return an empty array or handle error as needed
  }

  // Safely map over the users array
  return users.map((user) => usersocketIDs.get(user._id.toString()));
};
