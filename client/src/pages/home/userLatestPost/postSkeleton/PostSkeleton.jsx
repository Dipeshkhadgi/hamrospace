import React from 'react'

const PostSkeleton = () => {
  return (
    <div className="font-roboto bg-gray-100 min-h-screen flex flex-col items-center py-14">
      <div className="flex flex-col items-center mt-6 w-full max-w-lg">
        <div className="space-y-6 w-full">
          {/* Skeleton Loader for Post */}
          <div className="bg-white p-5 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 mb-6">
            <div className="flex items-center justify-between mb-3">
              {/* Skeleton for Avatar */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse"></div>
                <div>
                  {/* Skeleton for Name */}
                  <div className="w-24 h-4 bg-gray-300 rounded animate-pulse mb-2"></div>
                  {/* Skeleton for Time */}
                  <div className="w-16 h-3 bg-gray-300 rounded animate-pulse"></div>
                </div>
              </div>
              {/* Skeleton for Dots */}
              <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
            </div>

            {/* Skeleton for Caption */}
            <div className="w-3/4 h-4 bg-gray-300 rounded animate-pulse mb-3"></div>

            {/* Skeleton for Image */}
            <div className="w-full h-64 bg-gray-300 rounded animate-pulse mb-4"></div>

            {/* Skeleton for Post Interactions */}
            <div className="flex items-center justify-between text-gray-600 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* More skeleton loaders for other posts */}
          <div className="bg-white p-5 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 mb-6">
            <div className="flex items-center justify-between mb-3">
              {/* Skeleton for Avatar */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse"></div>
                <div>
                  {/* Skeleton for Name */}
                  <div className="w-24 h-4 bg-gray-300 rounded animate-pulse mb-2"></div>
                  {/* Skeleton for Time */}
                  <div className="w-16 h-3 bg-gray-300 rounded animate-pulse"></div>
                </div>
              </div>
              {/* Skeleton for Dots */}
              <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
            </div>

            {/* Skeleton for Caption */}
            <div className="w-3/4 h-4 bg-gray-300 rounded animate-pulse mb-3"></div>

            {/* Skeleton for Image */}
            <div className="w-full h-64 bg-gray-300 rounded animate-pulse mb-4"></div>

            {/* Skeleton for Post Interactions */}
            <div className="flex items-center justify-between text-gray-600 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default PostSkeleton
