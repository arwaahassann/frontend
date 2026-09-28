import ProfileImage from './ProfileImage';

const CompanyLogo = ({ src, company, size = 52, radius = 14, style = {} }) => {
  const frameStyle = {
    width: size,
    height: size,
    borderRadius: radius,
    flexShrink: 0,
    border: '1.5px solid #e2e8f0',
    ...style,
  };

  return (
    <ProfileImage
      src={src}
      alt={`${company || 'الشركة'} - شعار`}
      style={{ ...frameStyle, objectFit: 'cover' }}
    />
  );
};

export default CompanyLogo;
