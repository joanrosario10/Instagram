import React, { useEffect, useState } from "react";
import { Text, View, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Button from "~/src/components/Button";
import { supabase } from "~/src/lib/supabase";
import { useAuth } from "~/src/providers/AuthProvider";
import CustomTextInput from "~/src/components/CustomTextInput";
import { cld, uploadImage } from "~/src/lib/cloudinary";
import { thumbnail } from "@cloudinary/url-gen/actions/resize";
import { AdvancedImage } from "cloudinary-react-native";

type UserProfile = {
  id: string;
  username: string;
  bio: string;
  avatar_url?: string;
};

export default function ProfileScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [remoteImage, setRemoteImage] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      Alert.alert("Failed to fetch profile");
      console.error("Get Profile Error:", error);
      return;
    }

    setUsername(data.username);
    setBio(data.bio);
    setRemoteImage(data.avatar_url || null);
  };

  const updateProfile = async () => {
    if (!user) return;

    const updatedProfile: UserProfile = {
      id: user.id,
      username,
      bio,
    };

    if (image) {
      const response = await uploadImage(image);
      if (response) {
        updatedProfile.avatar_url = response.public_id;
      } else {
        Alert.alert("Failed to upload image");
        return;
      }
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updatedProfile)
      .eq("id", user.id);

    if (error) {
      Alert.alert("Failed to update profile");
      console.error("Update Profile Error:", error);
    } else {
      Alert.alert("Profile updated successfully");
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  let remoteCldImage;
  if (remoteImage) {
    remoteCldImage = cld.image(remoteImage);
    remoteCldImage.resize(thumbnail().width(300).height(300));
  }

  return (
    <View className="p-3 flex-1">
      {image ? (
        <Image
          source={{ uri: image }}
          className="w-52 aspect-square self-center rounded-full bg-slate-300"
        />
      ) : remoteCldImage ? (
        <AdvancedImage
          cldImg={remoteCldImage}
          className="w-52 aspect-square self-center rounded-full bg-slate-300"
        />
      ) : (
        <View className="w-52 aspect-square self-center rounded-full bg-slate-300" />
      )}
      <Text
        onPress={pickImage}
        className="text-blue-500 font-semibold m-5 self-center"
      >
        Change
      </Text>

      <View className="gap-5">
        <CustomTextInput
          label="Username"
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />

        <CustomTextInput
          label="Bio"
          placeholder="Bio"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={3}
        />
      </View>

      <View className="gap-2 mt-auto">
        <Button title="Update profile" onPress={updateProfile} />
        <Button title="Sign out" onPress={() => supabase.auth.signOut()} />
      </View>
    </View>
  );
}
