const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Course = require('./models/Course');
const Module = require('./models/Module');
const Lesson = require('./models/Lesson');
const Resource = require('./models/Resource');

const connectDB = require('./config/db');

const seedDB = async () => {
  try {
    await connectDB();
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Module.deleteMany({});
    await Lesson.deleteMany({});
    await Resource.deleteMany({});

    // ===================== USERS =====================
    console.log('👥 Creating users...');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@vfxvault.com',
      password: 'password123',
      role: 'admin',
    });

    const subscriber = await User.create({
      name: 'Alex Chen',
      email: 'alex@email.com',
      password: 'password123',
      role: 'subscriber',
      subscription: { status: 'active', plan: 'monthly' },
    });

    const student = await User.create({
      name: 'Sarah Kim',
      email: 'sarah@email.com',
      password: 'password123',
      role: 'user',
    });

    console.log('  ✅ 3 users created (admin, subscriber, user)');

    // ===================== COURSES =====================
    console.log('📚 Creating courses...');

    const course1 = await Course.create({
      title: '3D Rendering Pipeline from Scratch',
      slug: '3d-rendering-pipeline',
      shortDescription: 'Learn how a 3D rendering engine works from the ground up using C++ and linear algebra.',
      description: 'This course is a deep dive into the world of 3D computer graphics. We will build a complete software renderer from scratch using C/C++ and understand every step of the rendering pipeline — from reading OBJ files to rasterizing textured triangles on screen.\n\nOur journey covers the basics of linear algebra, projections, clipping, rasterization, textures, and much more.',
      category: 'Computer Graphics',
      difficulty: 'intermediate',
      accessType: 'premium',
      price: 79.99,
      totalDuration: '30 hours',
      isPublished: true,
      order: 1,
    });

    const course2 = await Course.create({
      title: 'Introduction to VFX Compositing',
      slug: 'intro-vfx-compositing',
      shortDescription: 'Master the fundamentals of visual effects compositing with industry-standard techniques.',
      description: 'This beginner-friendly course covers the core concepts of VFX compositing. You will learn about green screen keying, rotoscoping, color correction, and plate preparation.',
      category: 'VFX & Motion',
      difficulty: 'beginner',
      accessType: 'free',
      price: 0,
      totalDuration: '18 hours',
      isPublished: true,
      order: 2,
    });

    const course3 = await Course.create({
      title: 'Build a 2D Game Engine with C++',
      slug: 'build-2d-game-engine',
      shortDescription: 'Create a complete 2D game engine from scratch using modern C++, SDL, ECS, and Lua scripting.',
      description: 'In this project-based course, you will build a full 2D game engine from the ground up using SDL2, an Entity-Component-System architecture, Lua scripting, and modern C++ practices.',
      category: 'Game Development',
      difficulty: 'advanced',
      accessType: 'premium',
      price: 89.99,
      totalDuration: '25 hours',
      isPublished: true,
      order: 3,
    });

    const course4 = await Course.create({
      title: 'Data Structures & Algorithms',
      slug: 'data-structures-algorithms',
      shortDescription: 'Deep dive into essential data structures and algorithms with visualizations and hands-on coding.',
      description: 'A comprehensive course covering arrays, linked lists, trees, graphs, sorting algorithms, searching algorithms, dynamic programming, and more.',
      category: 'Computer Science',
      difficulty: 'intermediate',
      accessType: 'premium',
      price: 69.99,
      totalDuration: '22 hours',
      isPublished: true,
      order: 4,
    });

    const course5 = await Course.create({
      title: 'Learn Python from Scratch',
      slug: 'learn-python',
      shortDescription: 'A beginner-friendly introduction to Python programming with practical projects and exercises.',
      description: 'Start your programming journey with Python! This course covers variables, data types, control flow, functions, OOP, file handling, and more.',
      category: 'Programming Languages',
      difficulty: 'beginner',
      accessType: 'free',
      price: 0,
      totalDuration: '15 hours',
      isPublished: true,
      order: 5,
    });

    console.log('  ✅ 5 courses created');

    // ===================== MODULES & LESSONS =====================
    console.log('📖 Creating modules and lessons...');

    const createModulesAndLessons = async (course, modulesData) => {
      let totalLessons = 0;
      for (const modData of modulesData) {
        const mod = await Module.create({
          courseId: course._id,
          title: modData.title,
          order: modData.order,
        });

        for (const lessonData of modData.lessons) {
          await Lesson.create({
            moduleId: mod._id,
            courseId: course._id,
            ...lessonData,
          });
          totalLessons++;
        }
      }
      await Course.findByIdAndUpdate(course._id, { totalLessons });
    };

    // Course 1 modules
    await createModulesAndLessons(course1, [
      { title: 'Introduction', order: 1, lessons: [
        { title: 'Course Overview', type: 'video', videoDuration: '08:24', isFreePreview: true, order: 1 },
        { title: 'Setting Up the Environment', type: 'video', videoDuration: '15:30', isFreePreview: true, order: 2 },
        { title: 'Graphics Pipeline Overview', type: 'video', videoDuration: '22:15', order: 3 },
      ]},
      { title: 'Vectors and Points', order: 2, lessons: [
        { title: 'Vector Basics', type: 'video', videoDuration: '18:45', order: 1 },
        { title: 'Dot Product & Cross Product', type: 'video', videoDuration: '25:10', order: 2 },
        { title: 'Vector Operations in C', type: 'video', videoDuration: '20:30', order: 3 },
      ]},
      { title: 'Projecting Points', order: 3, lessons: [
        { title: 'Perspective Projection', type: 'video', videoDuration: '28:00', order: 1 },
        { title: 'Orthographic Projection', type: 'video', videoDuration: '16:45', order: 2 },
      ]},
      { title: 'Linear Transformations', order: 4, lessons: [
        { title: 'Scale & Rotation', type: 'video', videoDuration: '22:30', order: 1 },
        { title: 'Translation & Matrices', type: 'video', videoDuration: '19:15', order: 2 },
        { title: 'Combining Transformations', type: 'video', videoDuration: '24:00', order: 3 },
      ]},
      { title: 'Triangle Rasterization', order: 5, lessons: [
        { title: 'Flat Shading', type: 'video', videoDuration: '28:00', order: 1 },
        { title: 'Sorting Faces by Depth', type: 'video', videoDuration: '16:45', order: 2 },
        { title: 'Painter Algorithm', type: 'video', videoDuration: '21:30', order: 3 },
      ]},
    ]);

    // Course 2 modules
    await createModulesAndLessons(course2, [
      { title: 'Welcome to VFX', order: 1, lessons: [
        { title: 'What is VFX Compositing?', type: 'video', videoDuration: '10:20', isFreePreview: true, order: 1 },
        { title: 'Industry Overview', type: 'video', videoDuration: '14:00', isFreePreview: true, order: 2 },
      ]},
      { title: 'Green Screen Keying', order: 2, lessons: [
        { title: 'Keying Fundamentals', type: 'video', videoDuration: '25:30', order: 1 },
        { title: 'Edge Refinement', type: 'video', videoDuration: '18:45', order: 2 },
      ]},
      { title: 'Rotoscoping', order: 3, lessons: [
        { title: 'Roto Basics', type: 'video', videoDuration: '22:10', order: 1 },
        { title: 'Advanced Shapes', type: 'video', videoDuration: '19:30', order: 2 },
      ]},
    ]);

    // Course 3 modules
    await createModulesAndLessons(course3, [
      { title: 'Getting Started', order: 1, lessons: [
        { title: 'Project Architecture', type: 'video', videoDuration: '12:30', isFreePreview: true, order: 1 },
        { title: 'SDL Setup & Window', type: 'video', videoDuration: '20:15', isFreePreview: true, order: 2 },
      ]},
      { title: 'Game Loop', order: 2, lessons: [
        { title: 'Fixed Timestep', type: 'video', videoDuration: '18:00', order: 1 },
        { title: 'Input Handling', type: 'video', videoDuration: '15:45', order: 2 },
      ]},
      { title: 'ECS Architecture', order: 3, lessons: [
        { title: 'Entity Component System', type: 'video', videoDuration: '30:00', order: 1 },
        { title: 'Building Components', type: 'video', videoDuration: '25:30', order: 2 },
      ]},
    ]);

    console.log('  ✅ Modules and lessons created');

    // ===================== RESOURCES =====================
    console.log('📦 Creating resources...');

    await Resource.create([
      { title: 'PBR Material Pack — Metals', category: 'Assets & Textures', accessType: 'free', fileType: 'ZIP', fileSize: '45 MB', fileUrl: '/uploads/metals.zip', description: 'High-quality PBR metal textures', tags: ['PBR', 'Metals', 'Textures'], isPublished: true },
      { title: 'Game Engine Starter Template', category: 'Project Files', accessType: 'free', fileType: 'ZIP', fileSize: '12 MB', fileUrl: '/uploads/template.zip', description: 'C++ SDL starter template', tags: ['C++', 'SDL', 'Starter'], isPublished: true },
      { title: 'Studio HDRI Collection', category: 'Assets & Textures', accessType: 'premium', fileType: 'HDR', fileSize: '320 MB', fileUrl: '/uploads/studio.hdr', description: 'Studio lighting HDRIs', tags: ['HDRI', 'Studio', 'Lighting'], isPublished: true },
      { title: 'Low Poly Character Pack', category: 'Assets & Textures', accessType: 'free', fileType: 'FBX', fileSize: '28 MB', fileUrl: '/uploads/chars.fbx', description: 'Low poly character models', tags: ['3D', 'Low Poly', 'Character'], isPublished: true },
      { title: 'Linear Algebra Cheatsheet', category: 'PDFs & Guides', accessType: 'free', fileType: 'PDF', fileSize: '2.4 MB', fileUrl: '/uploads/math.pdf', description: 'Reference sheet for linear algebra', tags: ['Math', 'Linear Algebra'], isPublished: true },
      { title: 'VFX Breakdown Scene Files', category: 'Project Files', accessType: 'premium', fileType: 'ZIP', fileSize: '180 MB', fileUrl: '/uploads/vfx.zip', description: 'Nuke scene files from VFX breakdowns', tags: ['VFX', 'Nuke', 'Comp'], isPublished: true },
    ]);

    console.log('  ✅ 6 resources created');

    // ===================== DONE =====================
    console.log('\n✨ Database seeded successfully!\n');
    console.log('📧 Login credentials:');
    console.log('  Admin:      admin@vfxvault.com / password123');
    console.log('  Subscriber: alex@email.com / password123');
    console.log('  User:       sarah@email.com / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDB();
