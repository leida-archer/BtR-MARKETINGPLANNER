import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.postAsset.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.post.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.collaborator.deleteMany();
  await prisma.event.deleteMany();

  // Collaborators
  const archer = await prisma.collaborator.create({
    data: { name: "Archer", role: "Founder / Content Lead" },
  });
  const guestDJ = await prisma.collaborator.create({
    data: { name: "Guest DJ", role: "Artist Contributor" },
  });
  const photoPartner = await prisma.collaborator.create({
    data: { name: "Photo Partner", role: "Photographer / Videographer" },
  });

  // Tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "lineup-reveal", color: "#D6246E" } }),
    prisma.tag.create({ data: { name: "hype", color: "#E8652B" } }),
    prisma.tag.create({ data: { name: "UGC", color: "#F2A922" } }),
    prisma.tag.create({ data: { name: "recap", color: "#8B5CF6" } }),
    prisma.tag.create({ data: { name: "venue-spotlight", color: "#FF6B6B" } }),
    prisma.tag.create({ data: { name: "artist-spotlight", color: "#FFAB91" } }),
    prisma.tag.create({ data: { name: "behind-the-scenes", color: "#6366F1" } }),
    prisma.tag.create({ data: { name: "community", color: "#10B981" } }),
    prisma.tag.create({ data: { name: "ticket-push", color: "#F59E0B" } }),
    prisma.tag.create({ data: { name: "brand-intro", color: "#3B82F6" } }),
  ]);

  const tagMap: Record<string, string> = {};
  tags.forEach((t) => (tagMap[t.name] = t.id));

  // Events
  const launchNight = await prisma.event.create({
    data: {
      name: "BTR Launch Night",
      venue: "NOVA SD",
      date: new Date("2026-04-18T21:00:00"),
      description: "Beyond the Rhythm's inaugural event. Bass music, immersive production, community first.",
    },
  });

  const bassCommunion = await prisma.event.create({
    data: {
      name: "BTR x FIT Social: Bass Communion",
      venue: "FIT Social",
      date: new Date("2026-06-13T22:00:00"),
      description: "A collaborative night of experimental bass and dubstep at SD's newest venue.",
    },
  });

  // Posts — spread across the pipeline
  const posts = [
    // Week 1 brand launch content (posted/scheduled)
    {
      title: "'We are BTR' — Brand Intro Reel",
      platform: "instagram",
      postType: "reel",
      status: "posted",
      priority: "high",
      scheduledDate: new Date("2026-03-01"),
      scheduledTime: "19:00",
      caption: "we didn't come to follow the formula.\n\nBeyond the Rhythm — a new collective pushing San Diego's bass music scene forward.\n\nno gimmicks. no gatekeeping. just sound.\n\nstay tuned. 🔊",
      collaboratorId: archer.id,
      tagIds: [tagMap["brand-intro"], tagMap["hype"]],
    },
    {
      title: "Brand Intro — Reddit Thread",
      platform: "reddit",
      postType: "text",
      status: "posted",
      priority: "medium",
      scheduledDate: new Date("2026-03-01"),
      scheduledTime: "12:00",
      caption: "Hey SD,\n\nNew bass music collective dropping soon — Beyond the Rhythm.\n\nWe're building something real: underground sound, tight community, killer production.\n\nFollow along. First event announcement coming soon.",
      collaboratorId: archer.id,
      tagIds: [tagMap["brand-intro"], tagMap["community"]],
    },
    {
      title: "Mood / Aesthetic Carousel",
      platform: "instagram",
      postType: "carousel",
      status: "posted",
      priority: "medium",
      scheduledDate: new Date("2026-03-02"),
      scheduledTime: "18:00",
      caption: "This is the energy we're bringing.\n\nDark rooms. Deep bass. Real connections.\n\nBeyond the Rhythm — coming to San Diego.\n\n#BeyondTheRhythm #BassMusic #SanDiego",
      collaboratorId: archer.id,
      tagIds: [tagMap["hype"]],
    },
    {
      title: "Community Values Statement",
      platform: "instagram",
      postType: "carousel",
      status: "scheduled",
      priority: "high",
      scheduledDate: new Date("2026-03-03"),
      scheduledTime: "19:00",
      caption: "What Beyond the Rhythm stands for:\n\n1. Underground sound, always\n2. Inclusive by design\n3. Community over clout\n4. Artist-first bookings\n5. Production that hits different\n\nThis isn't just another promo brand.\n\n#BeyondTheRhythm",
      collaboratorId: archer.id,
      tagIds: [tagMap["community"], tagMap["brand-intro"]],
    },
    {
      title: "Behind the Name — Story Series",
      platform: "instagram",
      postType: "story",
      status: "scheduled",
      priority: "medium",
      scheduledDate: new Date("2026-03-04"),
      scheduledTime: "20:00",
      caption: "Why 'Beyond the Rhythm'?\n\nBecause the music is just the start. It's about the people, the space, the feeling.\n\nSwipe for the story behind the name.",
      collaboratorId: archer.id,
      tagIds: [tagMap["behind-the-scenes"], tagMap["brand-intro"]],
    },
    {
      title: "SD Bass Scene Appreciation Post",
      platform: "instagram",
      postType: "carousel",
      status: "approved",
      priority: "medium",
      scheduledDate: new Date("2026-03-05"),
      scheduledTime: "18:00",
      caption: "San Diego has always had underground heat.\n\nWe're here to turn up the volume.\n\nShoutout to everyone who's been pushing bass music in this city 🙏\n\n#SanDiegoBass #BeyondTheRhythm",
      collaboratorId: archer.id,
      tagIds: [tagMap["community"]],
    },
    {
      title: "Teaser: 'Something is Coming'",
      platform: "instagram",
      postType: "reel",
      status: "approved",
      priority: "high",
      scheduledDate: new Date("2026-03-06"),
      scheduledTime: "19:00",
      caption: "👀 something is coming.\n\nApril 2026. San Diego.\n\nStay locked in.\n\n#BeyondTheRhythm #ComingSoon",
      collaboratorId: archer.id,
      tagIds: [tagMap["hype"]],
      eventId: launchNight.id,
    },

    // Launch Night campaign posts (various statuses)
    {
      title: "BTR Launch Night — First Announcement",
      platform: "instagram",
      postType: "reel",
      status: "editing",
      priority: "high",
      scheduledDate: new Date("2026-03-19"),
      scheduledTime: "19:00",
      caption: "IT'S OFFICIAL 🔊\n\nBTR Launch Night\n📍 NOVA SD\n📅 April 18, 2026\n\nOur first event. Your first invite.\n\nTickets dropping soon.\n\n#BeyondTheRhythm #LaunchNight #NOVASD",
      collaboratorId: archer.id,
      tagIds: [tagMap["hype"]],
      eventId: launchNight.id,
    },
    {
      title: "Launch Night — Reddit Announcement",
      platform: "reddit",
      postType: "text",
      status: "scripted",
      priority: "medium",
      scheduledDate: new Date("2026-03-19"),
      scheduledTime: "12:00",
      caption: "SD bass heads — Beyond the Rhythm is throwing our first event.\n\nBTR Launch Night @ NOVA SD — April 18\n\nMore details and lineup coming soon. Who's in?",
      collaboratorId: archer.id,
      tagIds: [tagMap["community"]],
      eventId: launchNight.id,
    },
    {
      title: "Lineup Reveal Carousel",
      platform: "instagram",
      postType: "carousel",
      status: "in_production",
      priority: "high",
      scheduledDate: new Date("2026-03-28"),
      scheduledTime: "18:00",
      caption: "THE LINEUP 🎵\n\nSwipe to see who's bringing the heat to BTR Launch Night.\n\nTickets in bio. Limited capacity.\n\n#LineupReveal #BeyondTheRhythm #LaunchNight",
      collaboratorId: archer.id,
      tagIds: [tagMap["lineup-reveal"], tagMap["hype"]],
      eventId: launchNight.id,
    },
    {
      title: "Artist Spotlight — DJ Set Preview",
      platform: "instagram",
      postType: "reel",
      status: "idea",
      priority: "medium",
      scheduledDate: new Date("2026-04-04"),
      scheduledTime: "19:00",
      caption: "Get to know the artists on our Launch Night lineup 🔥\n\n#ArtistSpotlight #BeyondTheRhythm",
      collaboratorId: guestDJ.id,
      tagIds: [tagMap["artist-spotlight"]],
      eventId: launchNight.id,
    },
    {
      title: "NOVA SD Venue Spotlight",
      platform: "instagram",
      postType: "carousel",
      status: "idea",
      priority: "medium",
      scheduledDate: new Date("2026-04-08"),
      scheduledTime: "18:00",
      caption: "The space where it all begins 📍\n\nNOVA SD — intimate, underground, and built for bass.\n\n#VenueSpotlight #NOVASD #BeyondTheRhythm",
      collaboratorId: photoPartner.id,
      tagIds: [tagMap["venue-spotlight"]],
      eventId: launchNight.id,
    },
    {
      title: "Ticket Countdown Story",
      platform: "instagram",
      postType: "story",
      status: "idea",
      priority: "high",
      scheduledDate: new Date("2026-04-11"),
      scheduledTime: "20:00",
      caption: "⏰ One week until BTR Launch Night\n\nLimited tickets remaining. Link in bio.",
      collaboratorId: archer.id,
      tagIds: [tagMap["ticket-push"]],
      eventId: launchNight.id,
    },
    {
      title: "Final Push Reel",
      platform: "instagram",
      postType: "reel",
      status: "idea",
      priority: "urgent",
      scheduledDate: new Date("2026-04-15"),
      scheduledTime: "19:00",
      caption: "3 days. This is it.\n\nBTR Launch Night @ NOVA SD.\n\nDon't sleep 🔊\n\n#FinalPush #BeyondTheRhythm",
      collaboratorId: archer.id,
      tagIds: [tagMap["hype"], tagMap["ticket-push"]],
      eventId: launchNight.id,
    },

    // Bass Communion (future event — all ideas)
    {
      title: "Bass Communion — Save the Date",
      platform: "instagram",
      postType: "static",
      status: "idea",
      priority: "medium",
      scheduledDate: new Date("2026-05-14"),
      scheduledTime: "19:00",
      caption: "Mark your calendars 📅\n\nBTR x FIT Social: Bass Communion\nJune 13, 2026\n\nA night of experimental bass and dubstep.\n\n#BassCommunion #BeyondTheRhythm",
      collaboratorId: archer.id,
      tagIds: [tagMap["hype"]],
      eventId: bassCommunion.id,
    },
    {
      title: "FIT Social Venue Preview",
      platform: "instagram",
      postType: "reel",
      status: "idea",
      priority: "low",
      scheduledDate: new Date("2026-05-20"),
      scheduledTime: "18:00",
      caption: "SD's newest venue is about to get LOUD 🔊\n\nFIT Social x BTR — June 13.\n\n#FITSocial #BassCommunion",
      collaboratorId: photoPartner.id,
      tagIds: [tagMap["venue-spotlight"]],
      eventId: bassCommunion.id,
    },

    // Unattached posts (general brand content)
    {
      title: "Fan Playlist Curation",
      platform: "instagram",
      postType: "carousel",
      status: "idea",
      priority: "low",
      scheduledDate: null,
      scheduledTime: null,
      caption: "Our community picked the tracks 🎶\n\nSwipe for this month's BTR-curated playlist.\n\nDrop your adds in the comments.",
      collaboratorId: archer.id,
      tagIds: [tagMap["community"], tagMap["UGC"]],
    },
    {
      title: "Meme / Culture Post",
      platform: "instagram",
      postType: "static",
      status: "idea",
      priority: "low",
      scheduledDate: null,
      scheduledTime: null,
      caption: "When the bassline hits and everyone in the room just KNOWS 😤🔊",
      collaboratorId: archer.id,
      tagIds: [tagMap["community"]],
    },
    {
      title: "Reddit AMA Prep",
      platform: "reddit",
      postType: "text",
      status: "scripted",
      priority: "medium",
      scheduledDate: new Date("2026-03-25"),
      scheduledTime: "14:00",
      caption: "AMA: We're Beyond the Rhythm, a new bass music collective in San Diego. Ask us anything about our vision, upcoming events, and how we're building community through underground music.",
      collaboratorId: archer.id,
      tagIds: [tagMap["community"], tagMap["brand-intro"]],
    },
    {
      title: "TikTok Bass Drop Compilation",
      platform: "tiktok",
      postType: "reel",
      status: "idea",
      priority: "medium",
      scheduledDate: new Date("2026-03-10"),
      scheduledTime: "20:00",
      caption: "The drops that made us start BTR 🔊💀\n\n#bass #dubstep #bassmusic #sandiego",
      collaboratorId: archer.id,
      tagIds: [tagMap["hype"]],
    },
  ];

  for (const postData of posts) {
    const { tagIds, ...data } = postData;
    const post = await prisma.post.create({
      data: {
        ...data,
        tags: tagIds?.length
          ? { create: tagIds.map((tagId: string) => ({ tagId })) }
          : undefined,
      },
    });
    console.log(`Created post: ${post.title} [${post.status}]`);
  }

  console.log("\nSeed complete!");
  console.log(`  ${posts.length} posts`);
  console.log(`  2 events`);
  console.log(`  ${tags.length} tags`);
  console.log(`  3 collaborators`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
