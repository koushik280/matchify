"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/ui/glass-card";
import { PhotoUploader } from "@/components/profile/photo-uploader";
import { InterestsSelector } from "@/components/profile/interests-selector";
import { useProfile } from "@/hooks/useProfile";
import {
  profileUpdateSchema,
  type ProfileUpdateData,
} from "@/schemas/profile.schema";
import { Camera, Sparkles } from "lucide-react";
import Image from "next/image";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { VerifiedBadge } from "@/components/ui/verified-badge";

export default function ProfilePage() {
  const {
    profile,
    isLoading,
    updateProfile,
    isUpdating,
    uploadPhoto,
    isUploading,
    deletePhoto,
    isDeleting,
  } = useProfile();

  const [activeTab, setActiveTab] = useState("info");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: profile?.name || "",
      age: profile?.age || undefined,
      bio: profile?.bio || "",
      interests: profile?.interests || [],
    },
  });

  useEffect(() => {
    if (profile) {
      setValue("name", profile.name);
      setValue("age", profile.age || undefined);
      setValue("bio", profile.bio || "");
      setValue("interests", profile.interests || []);
    }
  }, [profile, setValue]);

  const onSubmit = (data: ProfileUpdateData) => updateProfile(data);
  const interests = watch("interests") || [];

  // Profile completion score
  const completion = (() => {
    let score = 0;
    if (profile?.name && profile.name.length > 1) score += 25;
    if (profile?.age && profile.age >= 18) score += 25;
    if (profile?.bio && profile.bio.length > 10) score += 25;
    if (profile?.photos && profile.photos.length > 0) score += 25;
    return score;
  })();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleSetMainPhoto = (photoUrl: string) => {
    if (!profile?.photos) return;
    const newPhotos = [
      photoUrl,
      ...profile.photos.filter((p) => p !== photoUrl),
    ];
    updateProfile({ photos: newPhotos });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* LEFT COLUMN – PROFILE CARD */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6 text-center backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 shadow-2xl">
            {/* Avatar with upload overlay */}
            <div className="relative w-36 h-36 mx-auto mb-4 group">
              <div className=" relative w-full h-full rounded-full overflow-hidden ring-4 ring-primary/30 shadow-xl">
                {profile?.photos?.[0] ? (
                  <Image
                    src={profile.photos[0]}
                    alt={profile.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {profile?.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary rounded-full p-2 cursor-pointer shadow-lg hover:bg-primary/80 transition">
                <Camera className="h-4 w-4 text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) uploadPhoto(e.target.files[0]);
                  }}
                />
              </label>
            </div>

            <h2 className="text-2xl font-bold bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {profile?.name}
              {profile?.isVerified && <VerifiedBadge />}
            </h2>
            <p className="text-muted-foreground mt-1">
              {profile?.age} years •{" "}
              {profile?.location ? "📍 Nearby" : "🌍 Add location"}
            </p>
            <p className="mt-3 text-sm italic">
              “{profile?.bio || "Tell the world something about yourself"}”
            </p>

            {/* Completion circular indicator */}
            <div className="mt-6 flex flex-col items-center">
              <div className="w-20 h-20">
                <CircularProgressbar
                  value={completion}
                  text={`${completion}%`}
                  styles={buildStyles({
                    textSize: "24px",
                    pathColor: "url(#gradient)",
                    textColor: "currentColor",
                    trailColor: "rgba(255,255,255,0.2)",
                  })}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Profile strength
              </p>
            </div>

            {/* Interest chips preview */}
            {profile?.interests && profile.interests.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Interests
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {profile.interests.slice(0, 6).map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs"
                    >
                      {interest}
                    </span>
                  ))}
                  {profile.interests.length > 6 && (
                    <span className="text-xs text-muted-foreground">
                      +{profile.interests.length - 6}
                    </span>
                  )}
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* RIGHT COLUMN – EDITABLE TABS */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 shadow-2xl">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-black/20 rounded-full p-1">
                <TabsTrigger
                  value="info"
                  className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Info
                </TabsTrigger>
                <TabsTrigger
                  value="photos"
                  className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Photos
                </TabsTrigger>
                <TabsTrigger
                  value="interests"
                  className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Interests
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="mt-6"
                >
                  <TabsContent value="info" className="space-y-5">
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-5"
                    >
                      <div>
                        <Label className="text-sm font-medium">Full Name</Label>
                        <Input
                          {...register("name")}
                          className="mt-1 bg-white/5 border-white/10 focus:border-primary"
                        />
                        {errors.name && (
                          <p className="text-xs text-red-400 mt-1">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Age</Label>
                        <Input
                          type="number"
                          {...register("age", { valueAsNumber: true })}
                          className="mt-1 bg-white/5 border-white/10"
                        />
                        {errors.age && (
                          <p className="text-xs text-red-400 mt-1">
                            {errors.age.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Bio</Label>
                        <Textarea
                          rows={4}
                          {...register("bio")}
                          className="mt-1 bg-white/5 border-white/10 resize-none"
                        />
                        {errors.bio && (
                          <p className="text-xs text-red-400 mt-1">
                            {errors.bio.message}
                          </p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        disabled={isUpdating}
                        className="w-full bg-primary hover:bg-primary/80"
                      >
                        {isUpdating ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="photos">
                    <PhotoUploader
                      photos={profile?.photos || []}
                      onUpload={uploadPhoto}
                      onDelete={deletePhoto}
                      onSetMain={handleSetMainPhoto}
                      isUploading={isUploading}
                      isDeleting={isDeleting}
                    />
                  </TabsContent>

                  <TabsContent value="interests">
                    <div className="space-y-5">
                      <InterestsSelector
                        selected={interests}
                        onChange={(newInterests) =>
                          setValue("interests", newInterests)
                        }
                      />
                      <Button
                        onClick={() => updateProfile({ interests })}
                        disabled={isUpdating}
                        className="w-full"
                      >
                        {isUpdating ? "Saving..." : "Save Interests"}
                      </Button>
                    </div>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </GlassCard>
        </div>
      </motion.div>
    </div>
  );
}
