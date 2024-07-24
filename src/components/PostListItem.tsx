import React from "react";
import { View, Text } from "react-native";
import { Ionicons, Feather, AntDesign } from "@expo/vector-icons";
import { AdvancedImage } from "cloudinary-react-native";
import { cld } from "../lib/cloudinary";
import { thumbnail } from "@cloudinary/url-gen/actions/resize";

type User = {
  username: string;
  avatar_url: string;
};

type Post = {
  id: string;
  media_type: "image" | "video";
  image: string;
  caption: string;
  user?: User; // user is optional
  my_likes?: any[];
  likes?: { count: number }[];
};

interface PostListItemProps {
  post: Post;
}

export default function PostListItem({ post }: PostListItemProps) {
  if (!post) {
    return <Text>No post data available</Text>; // Handle case where post is undefined
  }

  const { user, image, caption, likes } = post;

  // Use default values if user or its properties are undefined
  const username = user?.username || "New user";
  const avatarUrl = user?.avatar_url || "default_avatar_url";

  const avatar = cld.image(avatarUrl);
  avatar.resize(thumbnail().width(48).height(48));

  return (
    <View className="bg-white">
      {/* Header */}
      <View className="p-3 flex-row items-center gap-2">
        <AdvancedImage
          cldImg={avatar}
          className="w-12 aspect-square rounded-full"
        />
        <Text className="font-semibold">{username}</Text>
      </View>

      {/* Content */}
      <View className="w-full aspect-square bg-gray-200">
        <AdvancedImage
          cldImg={cld.image(image).resize(thumbnail().width(300).height(300))}
          className="w-full h-full"
        />
      </View>

      {/* Icons */}
      <View className="flex-row gap-3 p-3">
        <AntDesign name="hearto" size={20} color="black" />
        <Ionicons name="chatbubble-outline" size={20} />
        <Feather name="send" size={20} />
        <Feather name="bookmark" size={20} className="ml-auto" />
      </View>

      <View className="px-3 gap-1">
        <Text className="font-semibold">{likes?.[0]?.count || 0} likes</Text>
        <Text>
          <Text className="font-semibold">{username}</Text>
          {caption}
        </Text>
      </View>
    </View>
  );
}
