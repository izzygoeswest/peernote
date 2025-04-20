import React from 'react';

const getInitials = (nameOrEmail) => {
  if (!nameOrEmail) return '';
  const parts = nameOrEmail.split(' ');
  if (parts.length >= 2) {
    return parts[0][0] + parts[1][0];
  } else if (nameOrEmail.includes('@')) {
    return nameOrEmail[0].toUpperCase();
  } else {
    return nameOrEmail.slice(0, 2).toUpperCase();
  }
};

const Avatar = ({ user }) => {
  const name = user?.user_metadata?.name || user?.email || '';
  const initials = getInitials(name);

  return (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold text-lg">
        {initials}
      </div>
      <span className="text-gray-800 font-medium">{name}</span>
    </div>
  );
};

export default Avatar;
