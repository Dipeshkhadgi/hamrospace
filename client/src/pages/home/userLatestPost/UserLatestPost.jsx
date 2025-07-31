import moment from "moment";
import { memo, useEffect } from "react";
import { FaComment, FaShareAlt, FaThumbsUp } from "react-icons/fa";
import { HiOutlineDotsVertical } from "react-icons/hi";
import LazyImage from "./imageSkeleton/LazyImage";
import PostSkeleton from "./postSkeleton/PostSkeleton";

// Function to simulate infinite scroll and load more posts
const useInfiniteScroll = (isLoading, hasMore, loadMore) => {
  useEffect(() => {
    if (isLoading || !hasMore) return;

    const handleScroll = () => {
      const scrollPosition =
        document.documentElement.scrollTop + window.innerHeight;
      const bottomPosition = document.documentElement.scrollHeight;

      if (scrollPosition === bottomPosition) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isLoading, hasMore, loadMore]);
};

const UserLatestPost = memo(
  ({ followingPosts, isLoading, hasMore, loadMore }) => {
    // Using the infinite scroll hook
    useInfiniteScroll(isLoading, hasMore, loadMore);
    const skeletonCount =
      followingPosts && followingPosts.length > 0 ? followingPosts.length : 5;

    return (
      <div className="font-roboto bg-gray-100 min-h-screen flex flex-col items-center py-14">
        <div className="flex flex-col items-center mt-6 w-full max-w-lg">
          <div className="space-y-6 w-full">
            {isLoading ? (
              <PostSkeleton count={skeletonCount} />
            ) : followingPosts && followingPosts.length > 0 ? (
              followingPosts.map((item) => (
                <div
                  key={item._id}
                  className="bg-white p-5 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 mb-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                        {item?.owner?.avatar?.url ? (
                          <img
                            src={item?.owner?.avatar?.url}
                            alt={`${item?.owner?.name} Avatar`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-semibold text-lg flex items-center justify-center h-full w-full">
                            {item?.owner?.name[0]}
                          </span>
                        )}
                      </div>


                      <div>
                        <div className="font-semibold text-lg text-gray-800">
                          {item?.owner?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {moment(item.createdAt).fromNow()}
                        </div>
                      </div>
                    </div>
                    <HiOutlineDotsVertical className="text-gray-600 cursor-pointer hover:text-gray-800" />
                  </div>

                  <p className="text-gray-700 mb-3 text-base">{item.caption}</p>
                  {item?.postImg?.url && <LazyImage url={item?.postImg?.url} />}

                  <div className="flex items-center justify-between text-gray-600 text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-500">
                        <FaThumbsUp />
                        <span>{item.likes.length} Likes</span>
                      </div>
                      <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-500">
                        <FaComment />
                        <span>{item.comments.length} Comments</span>
                      </div>
                      <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-500">
                        <FaShareAlt />
                        <span>{item?.shares || 0} Shares</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="font-roboto text-gray-700 text-center text-xl">
                No Posts Available
              </div>
            )}

            {/* Loading spinner */}
            {isLoading && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full border-t-4 border-blue-500 w-8 h-8"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default UserLatestPost;
