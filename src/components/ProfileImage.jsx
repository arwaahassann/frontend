import { useEffect, useState } from 'react';

const DEFAULT_PROFILE_IMAGE = `${import.meta.env.BASE_URL}default-profile.png`;

const ProfileImage = ({ src, alt = '', ...props }) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  return (
    <img
      {...props}
      src={src && !imageFailed ? src : DEFAULT_PROFILE_IMAGE}
      alt={alt}
      onError={() => {
        if (!imageFailed) setImageFailed(true);
      }}
    />
  );
};

export default ProfileImage;
