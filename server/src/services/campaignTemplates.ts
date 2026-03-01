import { addDays } from "date-fns";

interface TemplatePost {
  title: string;
  platform: string;
  postType: string;
  scheduledDate: Date;
  scheduledTime: string;
  caption: string;
  status: string;
  priority: string;
}

const TEMPLATES = [
  { offset: -30, platform: "instagram", postType: "reel", time: "19:00", priority: "high", titleTemplate: "{event} — First Announcement", captionTemplate: "Something's coming to {venue}... 🔊\n\nMark your calendars. More details dropping soon.\n\n#BeyondTheRhythm #BassMusic #SanDiego" },
  { offset: -30, platform: "reddit", postType: "text", time: "12:00", priority: "medium", titleTemplate: "New event in SD — {event}", captionTemplate: "Hey SD bass heads,\n\nBeyond the Rhythm is bringing something special to {venue}. Stay tuned for lineup and ticket details.\n\nWho's down?" },
  { offset: -21, platform: "instagram", postType: "carousel", time: "18:00", priority: "high", titleTemplate: "{event} — Lineup Reveal", captionTemplate: "THE LINEUP IS HERE 🎵\n\nSwipe through to see who's bringing the bass to {venue}.\n\nTickets in bio.\n\n#BeyondTheRhythm #LineupReveal" },
  { offset: -14, platform: "instagram", postType: "reel", time: "19:00", priority: "medium", titleTemplate: "{event} — Artist Spotlight 1", captionTemplate: "Get to know the artists bringing heat to {event} 🔥\n\nSwipe for a taste of what's coming.\n\n#ArtistSpotlight #BeyondTheRhythm" },
  { offset: -14, platform: "reddit", postType: "text", time: "12:00", priority: "medium", titleTemplate: "{event} — Full details + ticket link", captionTemplate: "Full details for {event} at {venue}:\n\n📅 Date in bio\n🎵 Lineup revealed\n🎟️ Tickets available now\n\nLet's build something special in SD." },
  { offset: -10, platform: "instagram", postType: "carousel", time: "18:00", priority: "medium", titleTemplate: "What to Expect at {event}", captionTemplate: "Here's what you're walking into at {event} 👀\n\nProduction. Sound. Community.\n\nThis is Beyond the Rhythm.\n\n#WhatToExpect #BassMusic" },
  { offset: -7, platform: "instagram", postType: "reel", time: "19:00", priority: "high", titleTemplate: "{event} — Artist Spotlight 2", captionTemplate: "One week out. The energy is building 🌊\n\nMeet another artist joining us at {venue}.\n\n#OneWeekOut #BeyondTheRhythm" },
  { offset: -7, platform: "instagram", postType: "story", time: "20:00", priority: "medium", titleTemplate: "Ticket countdown + early bird CTA", captionTemplate: "⏰ One week until {event}\n\nEarly bird pricing ends soon. Link in bio." },
  { offset: -3, platform: "instagram", postType: "reel", time: "19:00", priority: "high", titleTemplate: "{event} — Final Push", captionTemplate: "3 days. Limited tickets remain.\n\nDon't sleep on {event} at {venue}.\n\n#FinalPush #BeyondTheRhythm" },
  { offset: -1, platform: "instagram", postType: "reel", time: "18:00", priority: "urgent", titleTemplate: "{event} — See You Tomorrow", captionTemplate: "TOMORROW NIGHT 🔊\n\n{venue}. You know the vibe.\n\nSee you there.\n\n#BeyondTheRhythm #Tomorrow" },
  { offset: -1, platform: "instagram", postType: "story", time: "15:00", priority: "high", titleTemplate: "Day-before setup + BTS teaser", captionTemplate: "Setting the stage for tomorrow night 🎛️\n\nBehind the scenes at {venue}." },
  { offset: 0, platform: "instagram", postType: "story", time: "21:00", priority: "urgent", titleTemplate: "{event} — LIVE Coverage", captionTemplate: "WE'RE LIVE 🔴\n\n{event} happening RIGHT NOW at {venue}.\n\nPull up." },
  { offset: 1, platform: "instagram", postType: "reel", time: "14:00", priority: "high", titleTemplate: "{event} — Morning-After Recap", captionTemplate: "Last night was special 🙏\n\nThank you to everyone who came out to {event}. This is just the beginning.\n\n#BeyondTheRhythm #Recap" },
  { offset: 1, platform: "reddit", postType: "text", time: "12:00", priority: "medium", titleTemplate: "{event} recap + photos + feedback", captionTemplate: "What a night! {event} at {venue} went OFF.\n\nPhotos coming soon. Drop your favorite moment in the comments.\n\nThank you SD 🙏" },
  { offset: 2, platform: "instagram", postType: "carousel", time: "18:00", priority: "medium", titleTemplate: "{event} — Photo Dump", captionTemplate: "The moments that made {event} unforgettable 📸\n\nTag yourself + share your shots.\n\n#PhotoDump #BeyondTheRhythm" },
  { offset: 4, platform: "instagram", postType: "reel", time: "19:00", priority: "medium", titleTemplate: "{event} — Fan Reactions / UGC", captionTemplate: "YOU made {event} what it was 💜\n\nHere's what the community had to say.\n\n#UGC #Community #BeyondTheRhythm" },
];

export function generateCampaignPosts(
  eventId: string,
  eventName: string,
  eventVenue: string,
  eventDate: Date
): TemplatePost[] {
  return TEMPLATES.map((t) => ({
    title: t.titleTemplate.replace(/\{event\}/g, eventName).replace(/\{venue\}/g, eventVenue),
    platform: t.platform,
    postType: t.postType,
    scheduledDate: addDays(eventDate, t.offset),
    scheduledTime: t.time,
    caption: t.captionTemplate.replace(/\{event\}/g, eventName).replace(/\{venue\}/g, eventVenue),
    status: "idea",
    priority: t.priority,
  }));
}
