
import React from 'react';
import { Campus, Task } from './types';

export const CAMPUSES: Campus[] = [
  { id: 'c1', name: 'IIT Bombay', city: 'Mumbai' },
  { id: 'c2', name: 'IIT Delhi', city: 'Delhi' },
  { id: 'c3', name: 'BITS Pilani', city: 'Pilani' },
  { id: 'c4', name: 'VIT Vellore', city: 'Vellore' },
  { id: 'c5', name: 'SRM University', city: 'Chennai' },
  { id: 'c6', name: 'Manipal Institute', city: 'Manipal' },
  { id: 'c7', name: 'Delhi University', city: 'Delhi' },
  { id: 'c8', name: 'Christ University', city: 'Bangalore' },
  { id: 'c9', name: 'Amity University', city: 'Noida' },
  { id: 'c10', name: 'LPU', city: 'Phagwara' },
  { id: 'c11', name: 'Symbiosis', city: 'Pune' },
  { id: 'c12', name: 'NIT Trichy', city: 'Trichy' },
  { id: 'c13', name: 'Anna University', city: 'Chennai' },
  { id: 'c14', name: 'Jadavpur University', city: 'Kolkata' },
  { id: 'c15', name: 'Osmania University', city: 'Hyderabad' },
  { id: 'c16', name: 'Panjab University', city: 'Chandigarh' },
  { id: 'c17', name: 'Loyola College', city: 'Chennai' },
  { id: 'c18', name: 'St. Stephens', city: 'Delhi' },
  { id: 'c19', name: 'RVCE', city: 'Bangalore' },
  { id: 'c20', name: 'PSG Tech', city: 'Coimbatore' },
  { id: 'c21', name: 'Thapar Institute', city: 'Patiala' },
  { id: 'c22', name: 'COEP', city: 'Pune' },
  { id: 'c23', name: 'DTU', city: 'Delhi' },
  { id: 'c24', name: 'BHU', city: 'Varanasi' },
  { id: 'c25', name: 'NMIMS', city: 'Mumbai' },
];

export const TASKS: Task[] = [
  {
    id: 't5',
    type: 'student_rewards',
    name: 'Share New User Coupons',
    description: 'Distribute coupons to students who haven\'t used Swiggy before.',
    instructions: 'Enter the details of the student who received the coupon. Verification will be done based on successful redemption.',
    points: 15
  },
  {
    id: 't3',
    type: 'social_media',
    name: 'Post on Social Media',
    description: 'Create and post engaging content about Swiggy on your social platforms.',
    instructions: 'Provide a link to your public post or reel. Quality and engagement will determine the final score.',
    points: 50
  },
  {
    id: 't4',
    type: 'referral',
    name: 'Invite Friends to Student Rewards',
    description: 'Get your friends to sign up for the Student Rewards program.',
    instructions: 'Enter your friend\'s details. Each unique signup earns you points.',
    points: 5
  },
  {
    id: 't2',
    type: 'streaks',
    name: 'Activate Campus Streak Day',
    description: 'Plan and submit your campus streak activation day.',
    instructions: 'Select the month and day. Note: Submissions for a month must be completed by the 25th of the previous month.',
    points: 25
  },
  {
    id: 't1',
    type: 'offline_activation',
    name: 'Distribute Posters / Flyers',
    description: 'Place promotional posters and flyers across the campus.',
    instructions: 'Submit the total count of flyers/posters distributed in this session.',
    points: 10
  },
];
