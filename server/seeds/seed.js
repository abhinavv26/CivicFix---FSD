require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

const seedData = async (isStandalone = false) => {
  try {
    console.log('[Seed] Seeding default users, realistic Mumbai civic issues, and notifications...');

    await Promise.all([
      User.deleteMany({}),
      Issue.deleteMany({}),
      Comment.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    // Seed Users
    const adminUser = await User.create({
      name: 'Rohan Deshmukh (Admin)',
      email: 'admin@civicfix.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91 98200 11223',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    const staffUser1 = await User.create({
      name: 'Suresh Patil (Field Officer)',
      email: 'staff@civicfix.com',
      password: 'Staff@123',
      role: 'staff',
      phone: '+91 98190 44556',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });

    const staffUser2 = await User.create({
      name: 'Anita Kamble (Sanitation Lead)',
      email: 'anita.kamble@civicfix.com',
      password: 'Staff@123',
      role: 'staff',
      phone: '+91 98700 88990',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    });

    const citizenUser1 = await User.create({
      name: 'Aarav Mehta',
      email: 'citizen@civicfix.com',
      password: 'Citizen@123',
      role: 'citizen',
      phone: '+91 99301 23456',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    });

    const citizenUser2 = await User.create({
      name: 'Priya Nair',
      email: 'priya.nair@civicfix.com',
      password: 'Citizen@123',
      role: 'citizen',
      phone: '+91 98209 87654',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    });

    // 15 Realistic Mumbai Civic Issues
    const mumbaiIssues = [
      {
        title: 'Deep Hazardous Pothole on Hill Road',
        category: 'Pothole',
        description: 'Large crater-sized pothole right opposite Marks & Spencer on Hill Road. Causing significant traffic jams and two-wheelers are skidding during peak rush hours.',
        images: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'],
        location: { type: 'Point', coordinates: [72.8335, 19.0558] },
        address: 'Hill Road, Near Marks & Spencer, Bandra West, Mumbai 400050',
        status: 'In Progress',
        reportedBy: citizenUser1._id,
        assignedTo: staffUser1._id,
        upvotes: [citizenUser1._id, citizenUser2._id],
        statusHistory: [
          { status: 'Reported', changedBy: citizenUser1._id, note: 'Initial citizen complaint filed with photo', timestamp: new Date(Date.now() - 48 * 3600000) },
          { status: 'Assigned', changedBy: adminUser._id, note: 'Assigned to Ward H-West asphalt maintenance team', timestamp: new Date(Date.now() - 36 * 3600000) },
          { status: 'In Progress', changedBy: staffUser1._id, note: 'Cold mix leveling team dispatched with roller equipment', timestamp: new Date(Date.now() - 12 * 3600000) },
        ],
      },
      {
        title: 'Overflowing Municipal Dumpster at Linking Road',
        category: 'Garbage',
        description: 'Large community bin has not been cleared for over 48 hours. Waste is spilling onto the pedestrian sidewalk and attracting stray animals.',
        images: ['https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=800&auto=format&fit=crop&q=80'],
        location: { type: 'Point', coordinates: [72.8354, 19.0625] },
        address: 'Linking Road, Junction of 24th Road, Bandra West, Mumbai 400050',
        status: 'Resolved',
        reportedBy: citizenUser2._id,
        assignedTo: staffUser2._id,
        proofImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
        upvotes: [citizenUser1._id],
        statusHistory: [
          { status: 'Reported', changedBy: citizenUser2._id, note: 'Reported overflowing garbage bins', timestamp: new Date(Date.now() - 72 * 3600000) },
          { status: 'Assigned', changedBy: adminUser._id, note: 'Assigned to Ward Sanitation Supervisor', timestamp: new Date(Date.now() - 60 * 3600000) },
          { status: 'In Progress', changedBy: staffUser2._id, note: 'Compactor vehicle scheduled for immediate lifting', timestamp: new Date(Date.now() - 40 * 3600000) },
          { status: 'Resolved', changedBy: staffUser2._id, note: 'Waste cleared, dumpster disinfected with bleaching powder', proofImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80', timestamp: new Date(Date.now() - 10 * 3600000) },
        ],
      },
      {
        title: 'High-Pressure Water Main Burst near Powai Lake',
        category: 'Water Leakage',
        description: 'Major drinking water pipeline rupture along JVLR near Powai Lake. Thousands of gallons of clean municipal water flooding the street and reducing water pressure in nearby societies.',
        images: ['https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80'],
        location: { type: 'Point', coordinates: [72.9054, 19.1245] },
        address: 'Jogeshwari-Vikhroli Link Rd, Opposite Powai Lake, Mumbai 400076',
        status: 'Assigned',
        reportedBy: citizenUser1._id,
        assignedTo: staffUser1._id,
        upvotes: [citizenUser1._id, citizenUser2._id],
        statusHistory: [
          { status: 'Reported', changedBy: citizenUser1._id, note: 'Water main burst emergency report', timestamp: new Date(Date.now() - 18 * 3600000) },
          { status: 'Assigned', changedBy: adminUser._id, note: 'Hydraulic engineer department alerted and assigned', timestamp: new Date(Date.now() - 6 * 3600000) },
        ],
      },
      {
        title: 'Dark Stretch - 4 Consecutive Broken Streetlights',
        category: 'Streetlight',
        description: 'Four street lamp posts are completely dark at night on Central Avenue, making it dangerous for women commuters walking from the bus stop.',
        images: ['https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80'],
        location: { type: 'Point', coordinates: [72.9123, 19.1189] },
        address: 'Central Ave, Hiranandani Gardens, Powai, Mumbai 400076',
        status: 'Reported',
        reportedBy: citizenUser2._id,
        assignedTo: null,
        upvotes: [citizenUser2._id],
        statusHistory: [
          { status: 'Reported', changedBy: citizenUser2._id, note: 'New streetlight failure report logged', timestamp: new Date(Date.now() - 8 * 3600000) },
        ],
      },
      {
        title: 'Broken Concrete Slab on Pedestrian Footpath',
        category: 'Other',
        description: 'Open storm drain gutter with missing concrete slab right outside Dadar Railway Station East exit. High pedestrian hazard for seniors and children.',
        images: ['https://images.unsplash.com/photo-1584463699042-45c11f44a958?w=800&auto=format&fit=crop&q=80'],
        location: { type: 'Point', coordinates: [72.8441, 19.0182] },
        address: 'Swami Gyan Jivandas Marg, Outside Dadar East Station, Mumbai 400014',
        status: 'In Progress',
        reportedBy: citizenUser1._id,
        assignedTo: staffUser1._id,
        upvotes: [citizenUser1._id],
        statusHistory: [
          { status: 'Reported', changedBy: citizenUser1._id, note: 'Reported broken footpath slab', timestamp: new Date(Date.now() - 50 * 3600000) },
          { status: 'Assigned', changedBy: adminUser._id, note: 'Forwarded to F-North maintenance crew', timestamp: new Date(Date.now() - 30 * 3600000) },
          { status: 'In Progress', changedBy: staffUser1._id, note: 'Barricaded hazard zone; replacement slab ordered from depot', timestamp: new Date(Date.now() - 14 * 3600000) },
        ],
      },
      {
        title: 'Construction Debris Dumped on Marine Drive Promenade',
        category: 'Garbage',
        description: 'Heavy rubble, cement sacks and demolition bricks left dumped on the promenade near Chowpatty end. Obstructing morning joggers and tourists.',
        images: ['https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80'],
        location: { type: 'Point', coordinates: [72.8225, 18.9542] },
        address: 'Netaji Subhash Chandra Bose Rd, Marine Drive, Mumbai 400020',
        status: 'Resolved',
        reportedBy: citizenUser2._id,
        assignedTo: staffUser2._id,
        proofImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
        upvotes: [citizenUser1._id, citizenUser2._id],
        statusHistory: [
          { status: 'Reported', changedBy: citizenUser2._id, note: 'Debris illegal dumping reported', timestamp: new Date(Date.now() - 90 * 3600000) },
          { status: 'Assigned', changedBy: adminUser._id, note: 'Assigned to Ward D Cleanliness Team', timestamp: new Date(Date.now() - 80 * 3600000) },
          { status: 'In Progress', changedBy: staffUser2._id, note: 'Dumper truck and earthmover deployed', timestamp: new Date(Date.now() - 40 * 3600000) },
          { status: 'Resolved', changedBy: staffUser2._id, note: 'All debris removed and pathway pressure washed', proofImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80', timestamp: new Date(Date.now() - 15 * 3600000) },
        ],
      },
      {
        title: 'Severe Road Subsidence and Asphalt Erosion',
        category: 'Pothole',
        description: 'Multiple connected deep potholes stretching 15 meters along the bus lane on Andheri-Kurla Road. Causing severe bus delays and vehicle axle damage.',
        images: ['https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80'],
        location: { type: 'Point', coordinates: [72.8692, 19.1136] },
        address: 'Andheri-Kurla Rd, Near Chakala Metro Station, Andheri East, Mumbai 400099',
        status: 'Assigned',
        reportedBy: citizenUser1._id,
        assignedTo: staffUser1._id,
        upvotes: [citizenUser1._id],
        statusHistory: [
          { status: 'Reported', changedBy: citizenUser1._id, note: 'Pothole cluster reported near metro station', timestamp: new Date(Date.now() - 22 * 3600000) },
          { status: 'Assigned', changedBy: adminUser._id, note: 'Assigned to Road Repair Division K-East', timestamp: new Date(Date.now() - 8 * 3600000) },
        ],
      },
      {
        title: 'Sparking Electrical Wire on Lamp Pole',
        category: 'Streetlight',
        description: 'Exposed wire inside streetlight casing sparking whenever breeze blows near Lokhandwala Market. Serious electrocution risk.',
        images: ['https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80'],
        location: { type: 'Point', coordinates: [72.8271, 19.1412] },
        address: 'Lokhandwala Complex, 2nd Cross Rd, Andheri West, Mumbai 400053',
        status: 'Reported',
        reportedBy: citizenUser2._id,
        assignedTo: null,
        upvotes: [citizenUser2._id],
        statusHistory: [
          { status: 'Reported', changedBy: citizenUser2._id, note: 'Electrical hazard reported', timestamp: new Date(Date.now() - 5 * 3600000) },
        ],
      },
      {
        title: 'Sewage Overflowing into Residential Lane',
        category: 'Water Leakage',
        description: 'Clogged subterranean drain chamber overflowing contaminated sewage water directly onto road. Intolerable stench and health hazard.',
        images: ['https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80'],
        location: { type: 'Point', coordinates: [72.8841, 19.0689] },
        address: 'LBS Marg, Near Phoenix Marketcity, Kurla West, Mumbai 400070',
        status: 'In Progress',
        reportedBy: citizenUser1._id,
        assignedTo: staffUser2._id,
        upvotes: [citizenUser1._id, citizenUser2._id],
        statusHistory: [
          { status: 'Reported', changedBy: citizenUser1._id, note: 'Sewage overflow reported', timestamp: new Date(Date.now() - 30 * 3600000) },
          { status: 'Assigned', changedBy: adminUser._id, note: 'Assigned to L Ward Drainage Team', timestamp: new Date(Date.now() - 20 * 3600000) },
          { status: 'In Progress', changedBy: staffUser2._id, note: 'Suction jetting tanker on site desilting the main line', timestamp: new Date(Date.now() - 4 * 3600000) },
        ],
      },
      {
        title: 'Broken Traffic Directional Sign Hanging Dangerously',
        category: 'Other',
        description: 'Overhead metal traffic signboard damaged by heavy monsoon wind, hanging by a single rusted bolt over the right lane.',
        images: ['https://images.unsplash.com/photo-1572945753563-80ac124ffddf?w=800&auto=format&fit=crop&q=80'],
        location: { type: 'Point', coordinates: [72.8688, 19.0654] },
        address: 'BKC Main Avenue, G Block, Bandra Kurla Complex, Mumbai 400051',
        status: 'Resolved',
        reportedBy: citizenUser2._id,
        assignedTo: staffUser1._id,
        proofImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80',
        upvotes: [citizenUser1._id],
        statusHistory: [
          { status: 'Reported', changedBy: citizenUser2._id, note: 'Hanging sign reported', timestamp: new Date(Date.now() - 96 * 3600000) },
          { status: 'Assigned', changedBy: adminUser._id, note: 'Emergency road safety crew notified', timestamp: new Date(Date.now() - 90 * 3600000) },
          { status: 'In Progress', changedBy: staffUser1._id, note: 'Hydraulic crane deployed', timestamp: new Date(Date.now() - 60 * 3600000) },
          { status: 'Resolved', changedBy: staffUser1._id, note: 'Sign post dismantled and secured with new industrial brackets', proofImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80', timestamp: new Date(Date.now() - 24 * 3600000) },
        ],
      },
      {
        title: 'Plastic and Food Waste Accumulation by Juhu Beach',
        category: 'Garbage',
        description: 'Post-weekend accumulation of single-use plastics and festival waste along the public access lane of Juhu Tara Road.',
        images: ['https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&auto=format&fit=crop&q=80'],
        location: { type: 'Point', coordinates: [72.8279, 19.0991] },
        address: 'Juhu Tara Rd, Near Palm Grove Hotel, Juhu, Mumbai 400049',
        status: 'Reported',
        reportedBy: citizenUser1._id,
        assignedTo: null,
        upvotes: [citizenUser1._id],
        statusHistory: [
          { status: 'Reported', changedBy: citizenUser1._id, note: 'Beach plastic waste pile reported', timestamp: new Date(Date.now() - 10 * 3600000) },
        ],
      },
      {
        title: 'Flickering Sodium Vapor Lamps along Colaba Causeway',
        category: 'Streetlight',
        description: 'Rapid flickering of high-mast streetlights creating disorienting glare and intermittent complete blackouts on the shopping strip.',
        images: ['https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80'],
        location: { type: 'Point', coordinates: [72.8315, 18.9186] },
        address: 'Shahid Bhagat Singh Rd, Colaba Causeway, Colaba, Mumbai 400001',
        status: 'Assigned',
        reportedBy: citizenUser2._id,
        assignedTo: staffUser1._id,
        upvotes: [citizenUser2._id],
        statusHistory: [
          { status: 'Reported', changedBy: citizenUser2._id, note: 'Streetlight flicker reported', timestamp: new Date(Date.now() - 16 * 3600000) },
          { status: 'Assigned', changedBy: adminUser._id, note: 'Assigned to Ward A electrical division', timestamp: new Date(Date.now() - 4 * 3600000) },
        ],
      },
      {
        title: 'Major Pothole Cluster near Malad Inorbit Mall',
        category: 'Pothole',
        description: 'Road surface completely peeled off across 30 meters after heavy rain. Low clearance hatchbacks constantly scrape bottoms.',
        images: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'],
        location: { type: 'Point', coordinates: [72.8344, 19.1764] },
        address: 'Link Road, Opposite Inorbit Mall, Malad West, Mumbai 400064',
        status: 'Reported',
        reportedBy: citizenUser1._id,
        assignedTo: null,
        upvotes: [citizenUser1._id],
        statusHistory: [
          { status: 'Reported', changedBy: citizenUser1._id, note: 'Potholes reported near Inorbit Mall', timestamp: new Date(Date.now() - 14 * 3600000) },
        ],
      },
      {
        title: 'Broken Underground Valve Flooding Chembur Roundabout',
        category: 'Water Leakage',
        description: 'Potable water spurting up from under road pavers at Diamond Garden roundabout. Creating large stagnant puddle and wasting water.',
        images: ['https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80'],
        location: { type: 'Point', coordinates: [72.8988, 19.0526] },
        address: 'Diamond Garden Circle, Chembur, Mumbai 400071',
        status: 'In Progress',
        reportedBy: citizenUser2._id,
        assignedTo: staffUser1._id,
        upvotes: [citizenUser1._id, citizenUser2._id],
        statusHistory: [
          { status: 'Reported', changedBy: citizenUser2._id, note: 'Valve leakage reported', timestamp: new Date(Date.now() - 32 * 3600000) },
          { status: 'Assigned', changedBy: adminUser._id, note: 'Assigned to M-West water works', timestamp: new Date(Date.now() - 24 * 3600000) },
          { status: 'In Progress', changedBy: staffUser1._id, note: 'Excavation in progress to replace ruptured valve gasket', timestamp: new Date(Date.now() - 6 * 3600000) },
        ],
      },
      {
        title: 'Fallen Banyan Tree Branch Blocking Ghatkopar Service Road',
        category: 'Other',
        description: 'Very heavy tree branch broke off and is fully blocking one-way service road near Eastern Express Highway entrance.',
        images: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'],
        location: { type: 'Point', coordinates: [72.9124, 19.0882] },
        address: 'Eastern Express Highway Service Rd, Ghatkopar East, Mumbai 400077',
        status: 'Resolved',
        reportedBy: citizenUser1._id,
        assignedTo: staffUser2._id,
        proofImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
        upvotes: [citizenUser1._id, citizenUser2._id],
        statusHistory: [
          { status: 'Reported', changedBy: citizenUser1._id, note: 'Road blocked by fallen branch', timestamp: new Date(Date.now() - 70 * 3600000) },
          { status: 'Assigned', changedBy: adminUser._id, note: 'Assigned to Garden Department tree cutting unit', timestamp: new Date(Date.now() - 65 * 3600000) },
          { status: 'In Progress', changedBy: staffUser2._id, note: 'Chainsaw crew on site slicing and clearing timber', timestamp: new Date(Date.now() - 30 * 3600000) },
          { status: 'Resolved', changedBy: staffUser2._id, note: 'All logs hauled away; lane fully reopened to traffic', proofImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80', timestamp: new Date(Date.now() - 8 * 3600000) },
        ],
      },
    ];

    const insertedIssues = await Issue.insertMany(mumbaiIssues);

    // Seed Sample Comments
    await Comment.create([
      {
        issue: insertedIssues[0]._id,
        user: citizenUser2._id,
        content: 'I take this road every evening and almost fell off my scooter yesterday! Really appreciate someone reporting this.',
      },
      {
        issue: insertedIssues[0]._id,
        user: staffUser1._id,
        content: 'Field team is currently applying quick-curing asphalt mix. Work should be completed within a few hours.',
      },
      {
        issue: insertedIssues[1]._id,
        user: citizenUser1._id,
        content: 'The smell was unbearable for the nearby school. Good to see it cleaned up so swiftly!',
      },
      {
        issue: insertedIssues[2]._id,
        user: staffUser1._id,
        content: 'Emergency pipeline shutoff valve has been engaged to prevent further water loss while we excavate.',
      },
    ]);

    // Seed Sample Notifications
    await Notification.create([
      {
        recipient: citizenUser1._id,
        sender: staffUser1._id,
        type: 'status_change',
        issue: insertedIssues[0]._id,
        title: 'Status Update: In Progress',
        message: 'Your report "Deep Hazardous Pothole on Hill Road" is now In Progress.',
        isRead: false,
      },
      {
        recipient: staffUser1._id,
        sender: adminUser._id,
        type: 'assignment',
        issue: insertedIssues[2]._id,
        title: 'New Emergency Ticket Assigned',
        message: 'You have been assigned to: High-Pressure Water Main Burst near Powai Lake',
        isRead: false,
      },
      {
        recipient: citizenUser2._id,
        sender: staffUser2._id,
        type: 'status_change',
        issue: insertedIssues[1]._id,
        title: 'Issue Resolved!',
        message: 'Your report "Overflowing Municipal Dumpster at Linking Road" has been successfully resolved.',
        isRead: true,
      },
    ]);

    console.log('✅ DATABASE SEEDING COMPLETED!');
    if (isStandalone) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    if (isStandalone) {
      process.exit(1);
    }
  }
};

// Check if running as a CLI script directly
if (require.main === module) {
  const { connectDB } = require('../config/db');
  connectDB().then(() => seedData(true));
}

module.exports = { seedData };
