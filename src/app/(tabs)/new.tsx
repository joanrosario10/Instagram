import { Text, View, Image, TextInput, Alert } from "react-native";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import Button from "~/src/components/Button";
import { uploadImage } from "~/src/lib/cloudinary";
import { supabase } from "~/src/lib/supabase";
import { useAuth } from "~/src/providers/AuthProvider";
import { router } from "expo-router";
import { ResizeMode, Video } from "expo-av";

export default function CreatePost() {
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"video" | "image" | undefined>();

  const { session } = useAuth();

  useEffect(() => {
    if (!media) {
      pickMedia();
    }
  }, [media]);

  const pickMedia = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled) {
        setMedia(result.assets[0].uri);
        setMediaType(result.assets[0].type);
      }
    } catch (error) {
      console.error("Error picking media:", error);
      Alert.alert("Error", "Failed to pick media.");
    }
  };

  const createPost = async () => {
    if (!media || !session?.user) {
      Alert.alert("Error", "No media selected or user not authenticated.");
      return;
    }

    try {
      const response = await uploadImage(media);

      if (!response?.public_id) {
        throw new Error("Failed to upload image");
      }

      const { data, error } = await supabase
        .from("posts")
        .insert([
          {
            caption,
            image: response.public_id,
            user_id: session.user.id,
            media_type: mediaType || "image", // default to 'image' if mediaType is undefined
          },
        ])
        .select();

      if (error) {
        console.error("Error inserting post:", error);
        Alert.alert("Error", "Failed to create post.");
        return;
      }

      router.push("/(tabs)");
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Failed to create post.");
    }
  };

  return (
    <View className="p-3 items-center flex-1">
      {/* Image picker */}
      {!media ? (
        <View className="w-52 aspect-[3/4] rounded-lg bg-slate-300" />
      ) : mediaType === "image" ? (
        <Image
          source={{ uri: media }}
          className="w-52 aspect-[3/4] rounded-lg bg-slate-300"
        />
      ) : (
        <Video
          className="w-52 aspect-[3/4] rounded-lg bg-slate-300"
          style={{ width: "100%", aspectRatio: 16 / 9 }}
          source={{
            uri: media,
          }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          shouldPlay
        />
      )}

      <Text onPress={pickMedia} className="text-blue-500 font-semibold m-5">
        Change
      </Text>

      {/* TextInput for caption */}
      <TextInput
        value={caption}
        onChangeText={(newValue) => setCaption(newValue)}
        placeholder="What is on your mind"
        className="w-full p-3"
      />

      {/* Button */}
      <View className="mt-auto w-full">
        <Button title="Share" onPress={createPost} />
      </View>
    </View>
  );
}
