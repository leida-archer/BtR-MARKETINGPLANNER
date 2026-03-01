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
  { offset: -30, platform: "instagram", postType: "reel", time: "19:00", priority: "high", title: "{event} \u2014 First Announcement", caption: "Something's coming to {venue}... \ud83d\udd0a\n\nMark your calendars. More details dropping soon.\n\n#BeyondTheRhythm #BassMusic #SanDiego" },
  { offset: -30, platform: "reddit", postType: "text", time: "12:00", priority: "medium", title: "New event in SD \u2014 {event}", caption: "Hey SD bass heads,\n\nBeyond the Rhythm is bringing something special to {venue}. Stay tuned for lineup and ticket details.\n\nWho's down?" },
  { offset: -21, platform: "instagram", postType: "carousel", time: "18:00", priority: "high", title: "{event} \u2014 Lineup Reveal", caption: "THE LINEUP IS HERE \ud83c\udfb5\n\nSwipe through to see who's bringing the bass to {venue}.\n\nTickets in bio.\n\n#BeyondTheRhythm #LineupReveal" },
  { offset: -14, platform: "instagram", postType: "reel", time: "19:00", priority: "medium", title: "{event} \u2014 Artist Spotlight 1", caption: "Get to know the artists bringing heat to {event} \ud83d\udd25\n\n#ArtistSpotlight #BeyondTheRhythm" },
  { offset: -14, platform: "reddit", postType: "text", time: "12:00", priority: "medium", title: "{event} \u2014 Full details + ticket link", caption: "Full details for {event} at {venue}:\n\n\ud83d\udcc5 Date in bio\n\ud83c\udfb5 Lineup revealed\n\ud83c\udf9f\ufe0f Tickets available now" },
  { offset: -10, platform: "instagram", postType: "carousel", time: "18:00", priority: "medium", title: "What to Expect at {event}", caption: "Here's what you're walking into at {event} \ud83d\udc40\n\nProduction. Sound. Community.\n\nThis is Beyond the Rhythm.\n\n#WhatToExpect #BassMusic" },
  { offset: -7, platform: "instagram", postType: "reel", time: "19:00", priority: "high", title: "{event} \u2014 One Week Out", caption: "One week out. The energy is building \ud83c\udf0a\n\n#OneWeekOut #BeyondTheRhythm" },
  { offset: -7, platform: "instagram", postType: "story", time: "20:00", priority: "medium", title: "Ticket countdown + early bird CTA", caption: "\u23f0 One week until {event}\n\nEarly bird pricing ends soon. Link in bio." },
  { offset: -3, platform: "instagram", postType: "reel", time: "19:00", priority: "high", title: "{event} \u2014 Final Push", caption: "3 days. Limited tickets remain.\n\nDon't sleep on {event} at {venue}.\n\n#FinalPush #BeyondTheRhythm" },
  { offset: -1, platform: "instagram", postType: "reel", time: "18:00", priority: "urgent", title: "{event} \u2014 See You Tomorrow", caption: "TOMORROW NIGHT \ud83d\udd0a\n\n{venue}. You know the vibe.\n\n#BeyondTheRhythm #Tomorrow" },
  { offset: -1, platform: "instagram", postType: "story", time: "15:00", priority: "high", title: "Day-before setup + BTS teaser", caption: "Setting the stage for tomorrow night \ud83c\udfdb\ufe0f\n\nBehind the scenes at {venue}." },
  { offset: 0, platform: "instagram", postType: "story", time: "21:00", priority: "urgent", title: "{event} \u2014 LIVE Coverage", caption: "WE'RE LIVE \ud83d\udd34\n\n{event} happening RIGHT NOW at {venue}.\n\nPull up." },
  { offset: 1, platform: "instagram", postType: "reel", time: "14:00", priority: "high", title: "{event} \u2014 Morning-After Recap", caption: "Last night was special \ud83d\ude4f\n\nThank you to everyone who came out to {event}. This is just the beginning.\n\n#BeyondTheRhythm #Recap" },
  { offset: 1, platform: "reddit", postType: "text", time: "12:00", priority: "medium", title: "{event} recap + photos + feedback", caption: "What a night! {event} at {venue} went OFF.\n\nPhotos coming soon. Drop your favorite moment in the comments.\n\nThank you SD \ud83d\ude4f" },
  { offset: 2, platform: "instagram", postType: "carousel", time: "18:00", priority: "medium", title: "{event} \u2014 Photo Dump", caption: "The moments that made {event} unforgettable \ud83d\udcf8\n\nTag yourself + share your shots.\n\n#PhotoDump #BeyondTheRhythm" },
  { offset: 4, platform: "instagram", postType: "reel", time: "19:00", priority: "medium", title: "{event} \u2014 Fan Reactions / UGC", caption: "YOU made {event} what it was \ud83d\udc9c\n\nHere's what the community had to say.\n\n#UGC #Community #BeyondTheRhythm" },
];

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function generateCampaignPosts(
  eventName: string,
  eventVenue: string,
  eventDate: Date,
): TemplatePost[] {
  return TEMPLATES.map((t) => ({
    title: t.title.replace(/\{event\}/g, eventName).replace(/\{venue\}/g, eventVenue),
    platform: t.platform,
    postType: t.postType,
    scheduledDate: addDays(eventDate, t.offset),
    scheduledTime: t.time,
    caption: t.caption.replace(/\{event\}/g, eventName).replace(/\{venue\}/g, eventVenue),
    status: "idea",
    priority: t.priority,
  }));
}
