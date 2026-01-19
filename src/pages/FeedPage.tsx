import { useEffect, useState, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { getPosts, setMode, resetPosts } from "../store/reducers/postSlice";
import { getStories } from "../store/reducers/storiesSlice";
import { Card, LoadingSpinner, Alert, Avatar } from "../components/ui";
import { PostCard } from "../components/post-card";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { StoryGroup } from "../store/reducers/storiesSlice";

export function FeedPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { posts, loading, error, hasMore, page, mode } = useAppSelector(
    (state) => state.post
  );
  const { stories, loading: storiesLoading } = useAppSelector(
    (state) => state.stories
  );
  const { user } = useAppSelector((state) => state.auth);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const postRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Reset and load initial posts and stories
    dispatch(resetPosts());
    dispatch(getPosts({ page: 1, limit: 50, mode }));
    dispatch(getStories());
  }, [dispatch, mode]);

  // Debug: Log posts to see what we're getting
  useEffect(() => {
    console.log("FeedPage - Posts state:", {
      postsLength: posts.length,
      posts: posts,
      loading,
      error,
      hasMore,
    });
  }, [posts, loading, error, hasMore]);

  // Intersection Observer for video auto-play (matching mobile app)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            // Auto-play video when post is in view
            const video = entry.target.querySelector("video");
            if (video && video.paused) {
              video.play().catch(() => {
                // Autoplay was prevented
              });
            }
          } else {
            // Pause video when post is out of view
            const video = entry.target.querySelector("video");
            if (video && !video.paused) {
              video.pause();
            }
          }
        });
      },
      {
        threshold: [0.5],
        rootMargin: "0px",
      }
    );

    postRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      postRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [posts]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      dispatch(getPosts({ page: page + 1, limit: 50, mode })).finally(() =>
        setIsLoadingMore(false)
      );
    }
  }, [dispatch, loading, hasMore, isLoadingMore, page, mode]);

  // Scroll snap handler - matching mobile app's pagingEnabled
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;

      // Find which post is currently in view (snap to nearest)
      const currentIndex = Math.round(scrollTop / containerHeight);
      if (currentIndex !== currentPostIndex) {
        setCurrentPostIndex(currentIndex);
      }

      // Load more when near bottom
      if (
        scrollTop + containerHeight >=
        container.scrollHeight - containerHeight * 2
      ) {
        loadMore();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [loadMore, currentPostIndex]);

  const handleModeChange = (newMode: "foryou" | "following") => {
    if (newMode !== mode) {
      dispatch(setMode(newMode));
    }
  };

  const handleStoryClick = (storyGroup: StoryGroup, storyIndex: number = 0) => {
    navigate(`/stories/${storyGroup.user_id}`, {
      state: { storyGroup, initialIndex: storyIndex },
    });
  };

  // Get user's own stories and other stories (matching mobile app structure)
  // Mobile app uses stories.user_data and stories.otherStories
  // But our API might return a flat array, so handle both cases
  const storiesData = stories as any;
  const userStories =
    storiesData?.user_data ||
    stories.find((s: StoryGroup) => s.user_id === user?._id);
  const otherStories =
    storiesData?.otherStories ||
    stories.filter((s: StoryGroup) => s.user_id !== user?._id);

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-bg flex flex-col">
      {/* Header with mode toggle - Matching mobile app */}
      <div className="sticky top-0 bg-bg z-20 border-b border-border">
        <div className="flex gap-2 p-4">
          <button
            onClick={() => handleModeChange("foryou")}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
              mode === "foryou"
                ? "bg-gradient-primary text-white shadow-md"
                : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"
            }`}
          >
            For You
          </button>
          <button
            onClick={() => handleModeChange("following")}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
              mode === "following"
                ? "bg-gradient-primary text-white shadow-md"
                : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"
            }`}
          >
            Following
          </button>
        </div>
      </div>

      {/* Stories Section - Matching mobile app (horizontal scroll at top) */}
      <div className="flex-shrink-0 border-b border-border bg-bg">
        <div className="flex items-center gap-3 px-4 py-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => navigate("/create-story")}
            className="
    fixed
    right-6
    bottom-24
    z-50
    w-14
    h-14
    rounded-full
    flex
    items-center
    justify-center
    bg-gradient-primary
    text-white
    shadow-md
    hover:scale-105
    transition-transform
  "
          >
            <Plus className="w-6 h-6" />
          </button>

          {/* Other users' stories */}
          {otherStories.map((storyGroup) => (
            <button
              key={storyGroup.user_id}
              onClick={() => handleStoryClick(storyGroup, 0)}
              className="flex-shrink-0 relative"
            >
              <Avatar
                src={storyGroup.user_image}
                alt={storyGroup.user_name}
                size="lg"
                className={`border-2 ${
                  storyGroup.stories.some((s) => s.views && s.views.length > 0)
                    ? "border-border"
                    : "border-brand-primary"
                }`}
              />
            </button>
          ))}

          {storiesLoading && stories.length === 0 && (
            <div className="flex items-center gap-2 text-text-secondary">
              <LoadingSpinner size="sm" />
              <span className="text-sm">Loading stories...</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="error" className="m-4">
          {error}
        </Alert>
      )}

      {/* Posts Feed - Full screen with snap scrolling (matching mobile app) */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto snap-y snap-mandatory scroll-smooth"
        style={{
          scrollSnapType: "y mandatory",
        }}
      >
        {posts.length === 0 && !loading ? (
          <div className="h-full flex items-center justify-center">
            <Card className="p-8 text-center">
              <p className="text-text-secondary">No posts found</p>
            </Card>
          </div>
        ) : (
          <div className="space-y-0">
            {posts.map((post, index) => (
              <div
                key={post._id}
                ref={(el) => {
                  postRefs.current[index] = el;
                }}
                className="h-screen snap-start snap-always flex-shrink-0"
                style={{
                  scrollSnapAlign: "start",
                }}
              >
                <div className="h-full flex flex-col">
                  {/* Full screen post - matching mobile app */}
                  <div className="flex-1 overflow-hidden relative">
                    <PostCard
                      post={post}
                      currentUserId={user?._id}
                      isFullScreen={true}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading more indicator */}
        {isLoadingMore && (
          <div className="h-screen flex items-center justify-center snap-start">
            <LoadingSpinner size="md" />
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="h-screen flex items-center justify-center snap-start">
            <div className="text-center text-text-secondary text-sm">
              No more posts to load
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
