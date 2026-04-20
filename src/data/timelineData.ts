import React from 'react';
import { History, Zap, GraduationCap, Target, Milestone, UserCheck, ShieldCheck } from 'lucide-react';

export interface TimelineItem {
  id: number;
  year: number;
  dateStr: string;
  title: string;
  school: string;
  description: string;
  icon: React.ReactNode;
}

export const timelineData: TimelineItem[] = [
  {
    id: 1,
    year: 2020,
    dateStr: 'Aug 14, 2020',
    title: 'The Digital Genesis',
    school: 'Content Creation Era',
    description: 'Started my first YouTube channel, marking the beginning of my deep dive into the digital world and content ecosystems.',
    icon: React.createElement(History, { size: 20 })
  },
  {
    id: 2,
    year: 2023,
    dateStr: '2023',
    title: 'A Chapter Closes',
    school: 'Resilience Phase',
    description: 'YouTube channel termination after 3 years. A massive learning phase focused on technical resilience and pivoting toward core engineering.',
    icon: React.createElement(Zap, { size: 20 })
  },
  {
    id: 3,
    year: 2025,
    dateStr: 'Early & Late 2025',
    title: 'Academic Pivot & Coding',
    school: 'Madhyamik & Skills',
    description: 'Passed 10th Boards with 93% in Mathematics. Transitioned to intense software development, mastering AI Prompting, React, and Scalable Architecture.',
    icon: React.createElement(GraduationCap, { size: 20 })
  },
  {
    id: 4,
    year: 2026,
    dateStr: 'April 9, 2026',
    title: 'The Academic Hiatus',
    school: 'JEE Advanced Focus',
    description: 'Paused active software engineering to dedicate 100% bandwidth to JEE 2027 and the IIT KGP CSE target.',
    icon: React.createElement(Milestone, { size: 20 })
  },
  {
    id: 5,
    year: 2027,
    dateStr: '2027',
    title: 'The Target reached',
    school: 'IIT Kharagpur CSE Class of 2031',
    description: 'Entering the elite Computer Science department at IIT KGP. A new era of technical rigor and architectural mastery begins.',
    icon: React.createElement(Target, { size: 20 })
  },
  {
    id: 6,
    year: 2031,
    dateStr: '2031',
    title: 'Architect of Scale',
    school: 'B.Tech Graduation',
    description: 'Entering the industry as a seasoned Architect, building distributed systems and AI-driven infrastructures.',
    icon: React.createElement(UserCheck, { size: 20 })
  },
  {
    id: 7,
    year: 2035,
    dateStr: '2035',
    title: 'Tech Leader / Innovator',
    school: 'Future Horizon',
    description: 'Leading global infrastructure projects, pushing the boundaries of AI integration and system stability for the next generation.',
    icon: React.createElement(ShieldCheck, { size: 20 })
  }
];
