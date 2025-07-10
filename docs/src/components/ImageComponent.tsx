import React from 'react';

const ImageComponent = ( {src} )=>{
  return (
    <div>
      <img src={src} alt="Centered" className="centered-image" />
    </div>
  );
}

export default ImageComponent;