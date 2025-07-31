import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import UserLatestPost from './userLatestPost/UserLatestPost';
import { clearPostError, getFollowingPosts } from '../../redux/features/post/postSlice';


const Home = () => {
  const { isLoading, error, followingPosts } = useSelector((state) => state.post);

  const dispatch = useDispatch()

  useEffect(() => {
    if (error) {
      dispatch(clearPostError());
    }
  }, [dispatch, error]);

  useEffect(() => {
    dispatch(getFollowingPosts());
  }, [dispatch]);

  const memoizedPosts = React.useMemo(() => followingPosts, [followingPosts]);

  return <UserLatestPost followingPosts={memoizedPosts} isLoading={isLoading} />;
};

export default Home;
