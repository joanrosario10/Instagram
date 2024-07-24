import React, { useEffect, useState } from "react";
import { FlatList, ActivityIndicator, View, Text } from "react-native";
import PostListItem from "~/src/components/PostListItem";
import { supabase } from "~/src/lib/supabase";
import { useAuth } from "~/src/providers/AuthProvider";

// Define the type for a user
type User = {
  username: string;
  avatar_url: string;
};

// Define the type for a post
type Post = {
  id: string;
  media_type: "image" | "video";
  image: string;
  caption: string;
  user: User; // Ensure user is a single object
};

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    if (!user) return;

    setLoading(true);
    setError(null); // Clear previous errors

    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        id,
        media_type,
        image,
        caption,
        user:profiles (
          username,
          avatar_url
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      setError("Something went wrong while fetching posts.");
      console.error("Fetch Posts Error:", error);
      setLoading(false);
      return;
    }

    if (!data) {
      setError("No data returned from the server.");
      setLoading(false);
      return;
    }

    // Ensure the fetched data matches the Post type
    const posts = data.map((post: any) => ({
      ...post,
      user: post.user || {}, // Ensure user is a single object
    }));

    setPosts(posts);
    setLoading(false);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return (
      <View>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => <PostListItem post={item} />}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        gap: 10,
        maxWidth: 512,
        alignSelf: "center",
        width: "100%",
      }}
      showsVerticalScrollIndicator={false}
      onRefresh={fetchPosts}
      refreshing={loading}
    />
  );
}
