import React, { memo, useState } from 'react'

const LazyImage = memo(({url}) => {
    const [loaded, setLoaded] = useState(false);
  return (
    <>
     <div className="relative w-full h-64 object-cover rounded-lg mb-4">
      {/* Skeleton Loader */}
      {!loaded && (
        <div className="absolute inset-0 bg-gray-300 rounded-lg animate-pulse" />
      )}
      {/* Image */}
      <img
        src={url}
        alt="Post Image"
        className={`w-full h-64 object-cover rounded-lg mb-4 transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />
    </div>
      
    </>
  )
}
)
export default LazyImage
