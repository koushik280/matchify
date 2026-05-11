import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import type { ProfileUpdateData } from "@/schemas/profile.schema";
import type { User } from "@/types/auth.types";
import type { AxiosError } from "axios";

// Helper to extract error message from Axios errors
const getErrorMessage = (error: unknown): string => {
  const axiosError = error as AxiosError<{ message: string }>;
  return (
    axiosError.response?.data?.message ||
    axiosError.message ||
    "Something went wrong"
  );
};

export function useProfile() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();

  // Fetch current user profile
  const {
    data: profile,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/profile/me");
      const userData = response.data.user;
      updateUser(userData); // sync with auth store
      return userData as User;
    },
    initialData: user || undefined,
  });

  // Update profile fields (name, bio, age, interests)
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const response = await api.patch("/profile/update", data);
      return response.data.user;
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      toast.success("Profile updated!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Upload photo
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("photo", file);
      const response = await api.post("/profile/upload-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.user;
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      toast.success("Photo uploaded!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Delete photo
  const deletePhotoMutation = useMutation({
    mutationFn: async (photoUrl: string) => {
      const response = await api.delete("/profile/delete-photo", {
        data: { photoUrl },
      });
      return response.data.user;
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      toast.success("Photo removed");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });

  return {
    profile,
    isLoading,
    refetch,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    uploadPhoto: uploadPhotoMutation.mutate,
    isUploading: uploadPhotoMutation.isPending,
    deletePhoto: deletePhotoMutation.mutate,
    isDeleting: deletePhotoMutation.isPending,
  };
}
