import React from 'react';
import { Campus, Task } from './types';

export const CAMPUSES: Campus[] = [
  { id: 'c1', name: 'IIT Bhubaneswar', city: 'Bhubaneswar' },
  { id: 'c2', name: 'Jaipur National University', city: 'Jaipur' },
  { id: 'c3', name: 'IIT Bhilai', city: 'Bhilai' },
  { id: 'c4', name: 'IIT Jodhpur', city: 'Jodhpur' },
  { id: 'c5', name: 'IMT Ghaziabad', city: 'Ghaziabad' },
  { id: 'c6', name: "St. Xavier's College (Autonomous), Kolkata", city: 'Kolkata' },
  { id: 'c7', name: "St. Xavier's University, Kolkata", city: 'Kolkata' },
  { id: 'c8', name: 'Institute of Engineering and Management', city: 'Kolkata' },
  { id: 'c9', name: 'University of Lucknow', city: 'Lucknow' },
  { id: 'c10', name: 'Vivekananda Global University Jaipur', city: 'Jaipur' },
  { id: 'c11', name: 'Rajasthan Institute of Engine and Technology', city: 'Jaipur' },
  { id: 'c12', name: 'SKIT JAIPUR', city: 'Jaipur' },
  { id: 'c13', name: 'JECRC FOUNDATION COLLEGE', city: 'Jaipur' },
  { id: 'c14', name: 'Swarnandhra college of engineering and technology', city: 'Narsapur' },
  { id: 'c15', name: 'IIM Indore', city: 'Indore' },
  { id: 'c16', name: 'IIM Jammu', city: 'Jammu' },
  { id: 'c17', name: 'National Institute of Technology Silchar', city: 'Silchar' },
  { id: 'c18', name: 'IIM Amritsar', city: 'Amritsar' },
  { id: 'c19', name: 'Indian Institute of Management Kashipur', city: 'Kashipur' },
  { id: 'c20', name: 'Rajarshi school of management and technology', city: 'Varanasi' },
  { id: 'c21', name: 'Sri Chaitanya institute of technology and research', city: 'Khammam' },
  { id: 'c22', name: 'BML Munjal University', city: 'Gurugram' },
  { id: 'c23', name: 'Parul University', city: 'Vadodara' },
  { id: 'c24', name: 'pcte', city: 'Ludhiana' },
  { id: 'c25', name: 'Gandhi engineering College', city: 'Bhubaneswar' },
  { id: 'c26', name: 'ORIENTAL INSTITUTE OF SCIENCE AND TECHNOLOGY', city: 'Bhopal' },
];

export const TASKS: Task[] = [
  {
    id: 't5',
    type: 'student_rewards',
    name: 'New User Coupon Distribution',
    description: 'Distribute coupons to students who haven\'t used Swiggy before.',
    instructions: 'Please enter the details of the student receiving the coupon. Coupon will be deemed verified upon successful redemption',
    points: 15,
    deadlineDays: 3
  },
  {
    id: 't4',
    type: 'referral',
    name: 'Student Rewards Referrals',
    description: 'Get your friends to sign up for the Student Rewards program.',
    instructions: "Refer your peers to sign up for Swiggy Student Rewards. Points will be awarded upon successful verification.",
    points: 5,
    deadlineDays: 2
  },
  {
    id: 't3',
    type: 'social_media',
    name: 'Social Media Post',
    description: 'Create and post engaging content about Swiggy on your social platforms.',
    instructions: 'Submit the link to your public social media post or reel promoting Swiggy’s offerings (Student Rewards, Streaks etc).',
    points: 50,
    deadlineDays: 5
  },
  {
    id: 't1',
    type: 'offline_activation',
    name: 'Flyer/Digital Poster Distribution',
    description: 'Place promotional posters and flyers across the campus.',
    instructions: 'Enter the total number of physical flyers or digital posters distributed. Submissions will be verified via campus engagement growth',
    points: 10,
    deadlineDays: 7
  },
  {
    id: 't2',
    type: 'streaks',
    name: 'Monthly Campus Streak Day Selection',
    description: 'Plan and submit your campus streak activation day.',
    instructions: 'Select the days on which Campus Streaks should run on your campus for the selected month. Kindly submit the details by the 25th of the current month to facilitate streak planning for the subsequent month.',
    points: 25,
    deadlineDays: 10
  },
];